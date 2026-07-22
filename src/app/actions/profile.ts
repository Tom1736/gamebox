"use server";

import { revalidatePath } from "next/cache";
import {
  AvatarImageError,
  optimizeAvatarUpload,
} from "@/lib/avatar-image";
import { mutationRateLimit } from "@/lib/persistent-rate-limit";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { profileSchema } from "@/lib/validation";

export type ProfileActionState = {
  success?: string;
  error?: string;
  fieldErrors?: { bio?: string[] };
};

type AvatarUpdateData = {
  avatarBytes?: Uint8Array<ArrayBuffer> | null;
  avatarMimeType?: string | null;
  avatarUpdatedAt?: Date | null;
};

export async function saveProfileAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireUser();
  const rateLimit = await mutationRateLimit(user.id);
  if (!rateLimit.allowed) {
    return { error: `You are doing that too quickly. Try again in ${rateLimit.retryAfterSeconds} seconds.` };
  }

  const result = profileSchema.safeParse({
    bio: formData.get("bio") ?? "",
    removeAvatar: formData.get("removeAvatar") === "on",
  });
  if (!result.success) return { fieldErrors: result.error.flatten().fieldErrors };

  const avatar = formData.get("avatar");
  const hasAvatar = avatar instanceof File && avatar.size > 0;

  let avatarData: AvatarUpdateData = result.data.removeAvatar
    ? { avatarBytes: null, avatarMimeType: null, avatarUpdatedAt: null }
    : {};

  if (hasAvatar) {
    try {
      const optimized = await optimizeAvatarUpload(avatar);
      avatarData = {
        avatarBytes: optimized.bytes,
        avatarMimeType: optimized.mimeType,
        avatarUpdatedAt: new Date(),
      };
    } catch (error) {
      return {
        error:
          error instanceof AvatarImageError
            ? error.message
            : "That image could not be processed.",
      };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { bio: result.data.bio || null, ...avatarData },
  });

  revalidatePath(`/users/${user.username}`);
  revalidatePath("/users");
  revalidatePath("/", "layout");
  return { success: "Profile updated." };
}
