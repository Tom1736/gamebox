"use server";

import { revalidatePath } from "next/cache";
import { mutationRateLimit } from "@/lib/persistent-rate-limit";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { profileSchema } from "@/lib/validation";

const MAX_AVATAR_BYTES = 1024 * 1024 * 5; // 5 MB
const ACCEPTED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type ProfileActionState = {
  success?: string;
  error?: string;
  fieldErrors?: { bio?: string[] };
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
  if (hasAvatar && !ACCEPTED_AVATAR_TYPES.has(avatar.type)) {
    return { error: "Use a JPEG, PNG, WebP, or GIF image." };
  }
  if (hasAvatar && avatar.size > MAX_AVATAR_BYTES) {
    return { error: "Keep your profile picture under 1 MB." };
  }

  const avatarData = hasAvatar
    ? {
        avatarBytes: new Uint8Array(await avatar.arrayBuffer()),
        avatarMimeType: avatar.type,
        avatarUpdatedAt: new Date(),
      }
    : result.data.removeAvatar
      ? { avatarBytes: null, avatarMimeType: null, avatarUpdatedAt: null }
      : {};

  await prisma.user.update({
    where: { id: user.id },
    data: { bio: result.data.bio || null, ...avatarData },
  });

  revalidatePath(`/users/${user.username}`);
  revalidatePath("/users");
  revalidatePath("/", "layout");
  return { success: "Profile updated." };
}
