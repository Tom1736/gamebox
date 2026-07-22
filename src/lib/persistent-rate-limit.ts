import "server-only";

import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { RateLimitResult } from "@/lib/rate-limit";

type PersistentRateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export async function consumePersistentRateLimit({
  key,
  limit,
  windowMs,
}: PersistentRateLimitOptions): Promise<RateLimitResult> {
  const bucketKey = hashKey(key);
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  await prisma.rateLimitBucket
    .create({ data: { key: bucketKey, count: 0, resetAt } })
    .catch(() => undefined);

  await prisma.rateLimitBucket.updateMany({
    where: { key: bucketKey, resetAt: { lte: now } },
    data: { count: 0, resetAt },
  });

  const updated = await prisma.rateLimitBucket.updateMany({
    where: { key: bucketKey, resetAt: { gt: now }, count: { lt: limit } },
    data: { count: { increment: 1 } },
  });

  const bucket = await prisma.rateLimitBucket.findUniqueOrThrow({
    where: { key: bucketKey },
    select: { count: true, resetAt: true },
  });

  return {
    allowed: updated.count === 1,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((bucket.resetAt.getTime() - now.getTime()) / 1000),
    ),
  };
}

export function mutationRateLimit(userId: string) {
  return consumePersistentRateLimit({
    key: `mutation:${userId}`,
    limit: 60,
    windowMs: 60_000,
  });
}
