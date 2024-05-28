import { title } from 'process';

import axios from 'axios';
import { v } from 'convex/values';

import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { action, mutation, query } from './_generated/server';
import { vid } from './util';

function getYouTubeId(url: string): string | null {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getBestThumbnail(thumbnails: any) {
  if (thumbnails.maxres) {
    return thumbnails.maxres.url;
  } else if (thumbnails.standard) {
    return thumbnails.standard.url;
  } else if (thumbnails.high) {
    return thumbnails.high.url;
  } else if (thumbnails.medium) {
    return thumbnails.medium.url;
  } else {
    return thumbnails.default.url;
  }
}

const getVideoInfo = async (youtubeId: string) => {
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&key=${youtubeApiKey}&part=snippet`;

  try {
    const response = await axios.get(url);
    const title = response.data.items[0].snippet.title;
    const tags = response.data.items[0].snippet.tags;
    const thumbnailUrl = getBestThumbnail(
      response.data.items[0].snippet.thumbnails,
    );
    return { title, tags, thumbnailUrl };
  } catch (error) {
    return { title: '', tags: '', thumbnailUrl: '' };
  }
};

export const addVideoInfo = mutation({
  args: {
    thumbnailUrl: v.string(),
    youtubeUrl: v.string(),
    title: v.string(),
    tags: v.optional(v.array(v.string())),
    userId: v.string(),
    youtubeId: v.string(),
  },
  handler: async (ctx, args) => {
    // Add Quiz Info to DB
    const videoId = await ctx.db.insert('videos', {
      thumbnailUrl: args.thumbnailUrl,
      youtubeUrl: args.youtubeUrl,
      title: args.title,
      tags: args.tags,
      userId: args.userId,
      youtubeId: args.youtubeId,
    });
    return videoId as Id<'videos'>;
  },
});

export const addVideo = action({
  args: {
    youtubeUrl: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get Youtube ID
    const youtubeId = getYouTubeId(args.youtubeUrl);
    // Get the Title, Tags and Thumbnail URL
    const { title, tags, thumbnailUrl } = await getVideoInfo(
      youtubeId as string,
    );
    // Add Video Info to DB
    const videoId: Id<'videos'> = await ctx.runMutation(
      api.videos.addVideoInfo,
      {
        youtubeUrl: args.youtubeUrl,
        title: title,
        tags: tags,
        thumbnailUrl: thumbnailUrl,
        userId: args.userId as Id<'users'>,
        youtubeId: youtubeId as string,
      },
    );
    return videoId;
  },
});

export const getVideo = query({
  args: { videoId: vid('videos') },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error('work item not found');
    }

    return video;
  },
});

export const getVideos = query({
  args: { userId: v.string() },

  handler: async (ctx, args) => {
    if (args.userId) {
      const videos = await ctx.db
        .query('videos')
        .withIndex('by_userId', (q) => q.eq('userId', args.userId))
        .collect();
      return videos;
    }
  },
});

export const deleteVideo = mutation({
  args: { videoId: vid('videos') },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.videoId);
  },
});

export const updateVideo = mutation({
  args: {
    videoId: vid('videos'),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error('video not found');
    }

    const toUpdate = {} as any;

    if (args.title) toUpdate.title = args.title;

    return await ctx.db.patch(args.videoId, toUpdate);
  },
});
