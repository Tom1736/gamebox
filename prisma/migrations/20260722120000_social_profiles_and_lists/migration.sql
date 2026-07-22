-- Extend profiles without changing existing user rows.
ALTER TABLE "User"
ADD COLUMN "bio" VARCHAR(500),
ADD COLUMN "avatarBytes" BYTEA,
ADD COLUMN "avatarMimeType" VARCHAR(32),
ADD COLUMN "avatarUpdatedAt" TIMESTAMP(3);

-- Existing whole-star ratings retain the same numeric value. The new check
-- accepts only half-star increments from 0.5 through 5.
ALTER TABLE "Review" DROP CONSTRAINT "Review_rating_check";
ALTER TABLE "Review"
ALTER COLUMN "rating" TYPE DOUBLE PRECISION USING "rating"::DOUBLE PRECISION,
ADD COLUMN "hoursPlayed" DOUBLE PRECISION;
ALTER TABLE "Review"
ADD CONSTRAINT "Review_rating_check"
CHECK (
  "rating" BETWEEN 0.5 AND 5
  AND "rating" * 2 = TRUNC("rating" * 2)
),
ADD CONSTRAINT "Review_hoursPlayed_check"
CHECK ("hoursPlayed" IS NULL OR ("hoursPlayed" >= 0 AND "hoursPlayed" <= 100000));

CREATE TABLE "ReviewComment" (
  "id" TEXT NOT NULL,
  "body" VARCHAR(500) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  CONSTRAINT "ReviewComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FavoriteGame" (
  "userId" TEXT NOT NULL,
  "gameId" INTEGER NOT NULL,
  "position" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FavoriteGame_pkey" PRIMARY KEY ("userId", "gameId"),
  CONSTRAINT "FavoriteGame_position_check" CHECK ("position" BETWEEN 1 AND 3)
);

CREATE TABLE "WishlistEntry" (
  "userId" TEXT NOT NULL,
  "gameId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WishlistEntry_pkey" PRIMARY KEY ("userId", "gameId")
);

CREATE TABLE "RateLimitBucket" (
  "key" VARCHAR(64) NOT NULL,
  "count" INTEGER NOT NULL,
  "resetAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "ReviewComment_reviewId_createdAt_idx" ON "ReviewComment"("reviewId", "createdAt");
CREATE INDEX "ReviewComment_userId_idx" ON "ReviewComment"("userId");
CREATE UNIQUE INDEX "FavoriteGame_userId_position_key" ON "FavoriteGame"("userId", "position");
CREATE INDEX "FavoriteGame_gameId_idx" ON "FavoriteGame"("gameId");
CREATE INDEX "WishlistEntry_gameId_idx" ON "WishlistEntry"("gameId");
CREATE INDEX "WishlistEntry_userId_createdAt_idx" ON "WishlistEntry"("userId", "createdAt" DESC);
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");

ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_reviewId_fkey"
FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FavoriteGame" ADD CONSTRAINT "FavoriteGame_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FavoriteGame" ADD CONSTRAINT "FavoriteGame_gameId_fkey"
FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WishlistEntry" ADD CONSTRAINT "WishlistEntry_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WishlistEntry" ADD CONSTRAINT "WishlistEntry_gameId_fkey"
FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
