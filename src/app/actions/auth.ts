"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { consumePersistentRateLimit } from "@/lib/persistent-rate-limit";
import { prisma } from "@/lib/prisma";
import { getClientAddress } from "@/lib/request";
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

  const clientAddress = await getClientAddress();
  const rateLimit = await consumePersistentRateLimit({
    key: `register:${clientAddress}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return { error: `Too many attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.` };
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

  const clientAddress = await getClientAddress();
  const [addressLimit, usernameLimit] = await Promise.all([
    consumePersistentRateLimit({
      key: `login-address:${clientAddress}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    }),
    consumePersistentRateLimit({
      key: `login-username:${result.data.username}`,
      limit: 8,
      windowMs: 10 * 60 * 1000,
    }),
  ]);
  const blockedLimit = !addressLimit.allowed ? addressLimit : !usernameLimit.allowed ? usernameLimit : null;
  if (blockedLimit) {
    return { error: `Too many sign-in attempts. Try again in ${blockedLimit.retryAfterSeconds} seconds.` };
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
