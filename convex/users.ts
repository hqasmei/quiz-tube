import { ConvexError, v } from 'convex/values';

import { api, internal } from './_generated/api';
import { Doc, Id } from './_generated/dataModel';
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  MutationCtx,
  query,
  QueryCtx,
} from './_generated/server';
import { getUserId } from './util';

export const createUser = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    profileImage: v.string(),
  },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (!user) {
      await ctx.db.insert('users', {
        name: args.name,
        userId: args.userId,
        email: args.email,
        profileImage: args.profileImage,
      });
    }
  },
});

export const getMyUser = query({
  args: {},
  async handler(ctx) {
    const userId = await getUserId(ctx);

    if (!userId) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (!user) {
      return null;
    }

    return user;
  },
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
  },
});

export const getUserMetadata = query({
  args: { userId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (!user) {
      return null;
    }

    return {
      profileImage: user?.profileImage,
      name: user.name,
    };
  },
});

export const getUserByIdInternal = internalQuery({
  args: { userId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    return user;
  },
});

export const getUserByUserId = (
  ctx: MutationCtx | QueryCtx,
  userId: string,
) => {
  return ctx.db
    .query('users')
    .withIndex('by_userId', (q) => q.eq('userId', userId))
    .first();
};

export const updateMyUser = mutation({
  args: { name: v.string() },
  async handler(ctx, args) {
    const userId = await getUserId(ctx);

    if (!userId) {
      throw new ConvexError('You must be logged in.');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (!user) {
      throw new ConvexError('user not found');
    }

    await ctx.db.patch(user._id, {
      name: args.name,
    });
  },
});

export const updateUser = internalMutation({
  args: {
    userId: v.string(),
    profileImage: v.string(),
  },
  handler: async (ctx, args) => {
    let user = await getUserByUserId(ctx, args.userId);

    if (!user) {
      throw new ConvexError('user with id not found');
    }

    await ctx.db.patch(user._id, {
      profileImage: args.profileImage,
    });
  },
});

export const deleteUser = internalMutation({
  args: { userId: v.string() },
  async handler(ctx, args) {
    const user = await getUserByUserId(ctx, args.userId);

    if (!user) {
      throw new ConvexError('could not find user');
    }

    await ctx.db.delete(user._id);
  },
});
