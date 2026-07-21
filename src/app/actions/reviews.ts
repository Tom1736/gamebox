"use server";

import { revalidatePath } from "next/cache";
import { getGame } from "@/lib/igdb";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { reviewSchema } from "@/lib/validation";

export type ReviewActionState = {
  success?: string;
  error?: string;
  fieldErrors?: {
    rating?: string[];
    body?: string[];
  };
};

export async function saveReviewAction(
  _state: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const user = await requireUser();
  const result = reviewSchema.safeParse({
    gameId: formData.get("gameId"),
    rating: formData.get("rating"),
    body: formData.get("body"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const game = await getGame(result.data.gameId);
  if (!game) return { error: "That game could not be found." };

  await prisma.$transaction(async (tx) => {
    await tx.game.upsert({
      where: { id: game.id },
      create: {
        id: game.id,
        slug: game.slug,
        name: game.name,
        summary: game.summary,
        coverUrl: game.coverUrl,
        releaseDate: game.releaseDate ? new Date(game.releaseDate) : null,
        genres: game.genres,
        platforms: game.platforms,
        igdbRating: game.rating,
        popularity: game.popularity,
      },
      update: {
        slug: game.slug,
        name: game.name,
        summary: game.summary,
        coverUrl: game.coverUrl,
        releaseDate: game.releaseDate ? new Date(game.releaseDate) : null,
        genres: game.genres,
        platforms: game.platforms,
        igdbRating: game.rating,
        popularity: game.popularity,
      },
    });

    await tx.review.upsert({
      where: {
        userId_gameId: { userId: user.id, gameId: game.id },
      },
      create: {
        userId: user.id,
        gameId: game.id,
        rating: result.data.rating,
        body: result.data.body || null,
      },
      update: {
        rating: result.data.rating,
        body: result.data.body || null,
      },
    });
  });

  revalidatePath("/");
  revalidatePath(`/games/${game.id}`);
  revalidatePath(`/users/${user.username}`);
  revalidatePath("/notifications");
  return { success: "Your review is live." };
}

export async function deleteReviewAction(formData: FormData) {
  const user = await requireUser();
  const gameId = Number(formData.get("gameId"));
  if (!Number.isInteger(gameId) || gameId <= 0) return;

  await prisma.review.deleteMany({
    where: { userId: user.id, gameId },
  });
  revalidatePath("/");
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/users/${user.username}`);
}
