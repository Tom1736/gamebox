"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authSchema } from "@/lib/validation";
import { createSession, deleteSession } from "@/lib/session";

export type AuthActionState = {
  error?: string;
  fieldErrors?: {
    username?: string[];
    password?: string[];
  };
};

export async function registerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = authSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: result.data.username },
    select: { id: true },
  });
  if (existingUser) return { error: "That username is already taken." };

  const passwordHash = await hash(result.data.password, 10);
  let userId: string;

  try {
    const user = await prisma.user.create({
      data: { username: result.data.username, passwordHash },
      select: { id: true },
    });
    userId = user.id;
  } catch {
    return { error: "That username is already taken." };
  }

  await createSession(userId);
  redirect("/");
}

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = authSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({
    where: { username: result.data.username },
    select: { id: true, passwordHash: true },
  });
  if (!user || !(await compare(result.data.password, user.passwordHash))) {
    return { error: "Username or password is incorrect." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
