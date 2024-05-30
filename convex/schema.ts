import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const quizStatusTypes = v.union(
  v.literal('processing'),
  v.literal('ready'),
);

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    endsOn: v.optional(v.number()),
  })
    .index('by_userId', ['userId'])
    .index('by_email', ['email']),
  videos: defineTable({
    thumbnailUrl: v.string(),
    youtubeUrl: v.string(),
    title: v.string(),
    summary: v.string(),
    tags: v.optional(v.array(v.string())),
    userId: v.string(),
    youtubeId: v.string(),
  }).index('by_userId', ['userId']),
  quizzes: defineTable({
    videoId: v.string(),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        answer: v.string(),
      }),
    ),
    createdBy: v.string(),
    status: quizStatusTypes,
  }).index('by_videoId', ['videoId']),
});
