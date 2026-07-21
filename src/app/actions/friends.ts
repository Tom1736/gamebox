"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { usernameSchema } from "@/lib/validation";

export async function toggleFriendAction(formData: FormData) {
  const user = await requireUser();
  const parsedUsername = usernameSchema.safeParse(formData.get("username"));
  if (!parsedUsername.success || parsedUsername.data === user.username) return;

  const target = await prisma.user.findUnique({
    where: { username: parsedUsername.data },
    select: { id: true, username: true },
  });
  if (!target) return;

  const friendship = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId: user.id, friendId: target.id } },
  });

  if (friendship) {
    await prisma.friendship.delete({
      where: { userId_friendId: { userId: user.id, friendId: target.id } },
    });
  } else {
    await prisma.friendship.create({
      data: { userId: user.id, friendId: target.id },
    });
  }

  revalidatePath(`/users/${target.username}`);
  revalidatePath("/users");
  revalidatePath("/notifications");
}

export async function markNotificationsReadAction() {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { lastNotificationCheckAt: new Date() },
  });
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
