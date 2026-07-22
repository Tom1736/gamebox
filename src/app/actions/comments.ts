"use server";

import { revalidatePath } from "next/cache";
import { mutationRateLimit } from "@/lib/persistent-rate-limit";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { commentSchema } from "@/lib/validation";

export type CommentActionState = {
  success?: string;
  error?: string;
  fieldErrors?: { body?: string[] };
};

export async function addCommentAction(
  _state: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const user = await requireUser();
  const rateLimit = await mutationRateLimit(user.id);
  if (!rateLimit.allowed) {
    return { error: `You are doing that too quickly. Try again in ${rateLimit.retryAfterSeconds} seconds.` };
  }

  const result = commentSchema.safeParse({
    reviewId: formData.get("reviewId"),
    body: formData.get("body"),
  });
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const review = await prisma.review.findUnique({
    where: { id: result.data.reviewId },
    select: { gameId: true, userId: true, user: { select: { username: true } } },
  });
  if (!review) return { error: "That review no longer exists." };
  if (review.userId === user.id) return { error: "You cannot comment on your own review." };

  await prisma.reviewComment.create({
    data: { reviewId: result.data.reviewId, userId: user.id, body: result.data.body },
  });

  revalidatePath(`/games/${review.gameId}`);
  revalidatePath(`/users/${review.user.username}`);
  return { success: "Comment posted." };
}

export async function deleteCommentAction(formData: FormData) {
  const user = await requireUser();
  const rateLimit = await mutationRateLimit(user.id);
  if (!rateLimit.allowed) return;

  const commentId = formData.get("commentId");
  if (typeof commentId !== "string" || !commentId) return;
  const comment = await prisma.reviewComment.findFirst({
    where: { id: commentId, userId: user.id },
    select: { review: { select: { gameId: true, user: { select: { username: true } } } } },
  });
  if (!comment) return;

  await prisma.reviewComment.delete({ where: { id: commentId } });
  revalidatePath(`/games/${comment.review.gameId}`);
  revalidatePath(`/users/${comment.review.user.username}`);
}
