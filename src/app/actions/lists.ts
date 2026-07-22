"use server";

import { revalidatePath } from "next/cache";
import { gameUpsertData } from "@/lib/games";
import { getGame } from "@/lib/igdb";
import { mutationRateLimit } from "@/lib/persistent-rate-limit";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { favoriteActionSchema, gameListActionSchema } from "@/lib/validation";

async function revalidateGameLists(username: string, gameId: number) {
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/users/${username}`);
  revalidatePath("/");
}

export async function toggleWishlistAction(formData: FormData) {
  const user = await requireUser();
  const rateLimit = await mutationRateLimit(user.id);
  if (!rateLimit.allowed) return;

  const result = gameListActionSchema.safeParse({ gameId: formData.get("gameId") });
  if (!result.success) return;

  const game = await getGame(result.data.gameId);
  if (!game) return;

  await prisma.$transaction(async (tx) => {
    await tx.game.upsert({
      where: { id: game.id },
      create: { id: game.id, ...gameUpsertData(game) },
      update: gameUpsertData(game),
    });
    const deleted = await tx.wishlistEntry.deleteMany({
      where: { userId: user.id, gameId: game.id },
    });
    if (deleted.count === 0) {
      await tx.wishlistEntry.create({ data: { userId: user.id, gameId: game.id } });
    }
  });

  await revalidateGameLists(user.username, game.id);
}

export async function setFavoriteAction(formData: FormData) {
  const user = await requireUser();
  const rateLimit = await mutationRateLimit(user.id);
  if (!rateLimit.allowed) return;

  const result = favoriteActionSchema.safeParse({
    gameId: formData.get("gameId"),
    position: formData.get("position"),
  });
  if (!result.success) return;

  const game = await getGame(result.data.gameId);
  if (!game) return;

  await prisma.$transaction(async (tx) => {
    await tx.game.upsert({
      where: { id: game.id },
      create: { id: game.id, ...gameUpsertData(game) },
      update: gameUpsertData(game),
    });
    await tx.favoriteGame.deleteMany({
      where: {
        userId: user.id,
        OR: [{ gameId: game.id }, { position: result.data.position }],
      },
    });
    await tx.favoriteGame.create({
      data: { userId: user.id, gameId: game.id, position: result.data.position },
    });
  });

  await revalidateGameLists(user.username, game.id);
}

export async function removeFavoriteAction(formData: FormData) {
  const user = await requireUser();
  const rateLimit = await mutationRateLimit(user.id);
  if (!rateLimit.allowed) return;

  const result = gameListActionSchema.safeParse({ gameId: formData.get("gameId") });
  if (!result.success) return;

  await prisma.favoriteGame.deleteMany({
    where: { userId: user.id, gameId: result.data.gameId },
  });
  await revalidateGameLists(user.username, result.data.gameId);
}
