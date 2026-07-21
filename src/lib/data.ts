import "server-only";

import { prisma } from "@/lib/prisma";

const reviewInclude = {
  user: { select: { username: true } },
  game: {
    select: {
      id: true,
      name: true,
      coverUrl: true,
      releaseDate: true,
      genres: true,
    },
  },
} as const;

export function getRecentReviews(limit = 6) {
  return prisma.review.findMany({
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getFriendReviews(userId: string, limit = 20) {
  const friendships = await prisma.friendship.findMany({
    where: { userId },
    select: { friendId: true },
  });
  const friendIds = friendships.map((item) => item.friendId);
  if (friendIds.length === 0) return [];

  return prisma.review.findMany({
    where: { userId: { in: friendIds } },
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadNotificationCount(
  userId: string,
  since: Date,
) {
  const friendships = await prisma.friendship.findMany({
    where: { userId },
    select: { friendId: true },
  });
  const friendIds = friendships.map((item) => item.friendId);
  if (friendIds.length === 0) return 0;

  return prisma.review.count({
    where: {
      userId: { in: friendIds },
      createdAt: { gt: since },
    },
  });
}

export function getGameReviews(gameId: number) {
  return prisma.review.findMany({
    where: { gameId },
    include: { user: { select: { username: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export function getUserProfile(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      createdAt: true,
      reviews: {
        include: { game: true },
        orderBy: { updatedAt: "desc" },
      },
      _count: {
        select: { reviews: true, friends: true },
      },
    },
  });
}

export function searchUsers(query: string) {
  return prisma.user.findMany({
    where: query
      ? { username: { contains: query, mode: "insensitive" } }
      : undefined,
    select: {
      id: true,
      username: true,
      createdAt: true,
      _count: { select: { reviews: true, friends: true } },
      reviews: {
        select: { rating: true },
      },
    },
    orderBy: { username: "asc" },
    take: 50,
  });
}
