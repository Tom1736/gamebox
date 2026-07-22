import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const reviewInclude = {
  user: { select: { username: true, avatarUpdatedAt: true } },
  game: {
    select: {
      id: true,
      name: true,
      coverUrl: true,
      releaseDate: true,
      genres: true,
    },
  },
  _count: { select: { comments: true } },
} as const;

export type ProfileReviewSort = "date" | "rating";

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

export async function getUnreadNotificationCount(userId: string, since: Date) {
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
    include: {
      user: { select: { id: true, username: true, avatarUpdatedAt: true } },
      comments: {
        include: { user: { select: { id: true, username: true, avatarUpdatedAt: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getUserProfile(username: string, sort: ProfileReviewSort = "date") {
  const reviewOrder: Prisma.ReviewOrderByWithRelationInput[] =
    sort === "rating"
      ? [{ rating: "desc" }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }];

  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      bio: true,
      avatarUpdatedAt: true,
      createdAt: true,
      reviews: {
        include: {
          game: true,
          _count: { select: { comments: true } },
        },
        orderBy: reviewOrder,
      },
      favoriteGames: {
        include: { game: true },
        orderBy: { position: "asc" },
      },
      wishlist: {
        include: { game: true },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { reviews: true, friends: true, wishlist: true },
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
      bio: true,
      avatarUpdatedAt: true,
      createdAt: true,
      _count: { select: { reviews: true, friends: true, wishlist: true } },
      reviews: {
        select: { rating: true },
      },
    },
    orderBy: { username: "asc" },
    take: 50,
  });
}

export async function getUserFriends(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      friends: {
        select: {
          createdAt: true,
          friend: {
            select: {
              id: true,
              username: true,
              bio: true,
              avatarUpdatedAt: true,
              _count: { select: { reviews: true, friends: true } },
              reviews: { select: { rating: true } },
            },
          },
        },
        orderBy: { friend: { username: "asc" } },
      },
    },
  });

  return user
    ? { ...user, friends: user.friends.map((friendship) => friendship.friend) }
    : null;
}

export async function getHighestRatedGames(limit = 10) {
  const ratings = await prisma.review.groupBy({
    by: ["gameId"],
    _avg: { rating: true },
    _count: { rating: true },
    orderBy: [{ _avg: { rating: "desc" } }, { _count: { rating: "desc" } }],
    take: limit,
  });
  if (ratings.length === 0) return [];

  const games = await prisma.game.findMany({
    where: { id: { in: ratings.map((rating) => rating.gameId) } },
    select: {
      id: true,
      name: true,
      coverUrl: true,
      releaseDate: true,
      genres: true,
    },
  });
  const gamesById = new Map(games.map((game) => [game.id, game]));

  return ratings.flatMap((rating) => {
    const game = gamesById.get(rating.gameId);
    return game && rating._avg.rating !== null
      ? [{ ...game, averageRating: rating._avg.rating, reviewCount: rating._count.rating }]
      : [];
  });
}
