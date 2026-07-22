import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters.")
  .max(24, "Use no more than 24 characters.")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Use only letters, numbers, and underscores.",
  )
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(6, "Use at least 6 characters.")
  .max(72, "Use no more than 72 characters.");

export const authSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const reviewSchema = z.object({
  gameId: z.coerce.number().int().positive(),
  rating: z.coerce
    .number()
    .min(0.5, "Choose at least half a star.")
    .max(5, "Ratings cannot exceed five stars.")
    .refine((rating) => Number.isInteger(rating * 2), {
      message: "Choose a rating in half-star steps.",
    }),
  body: z
    .string()
    .trim()
    .max(2000, "Keep your review under 2,000 characters."),
  hoursPlayed: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
      .number()
      .finite()
      .min(0, "Hours played cannot be negative.")
      .max(100000, "Hours played is too large.")
      .optional(),
  ),
});

export const gameSearchSchema = z.string().trim().max(80);

export const profileSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(500, "Keep your description under 500 characters."),
  removeAvatar: z.boolean().default(false),
});

export const commentSchema = z.object({
  reviewId: z.string().cuid(),
  body: z
    .string()
    .trim()
    .min(1, "Write a comment first.")
    .max(500, "Keep your comment under 500 characters."),
});

export const gameListActionSchema = z.object({
  gameId: z.coerce.number().int().positive(),
});

export const favoriteActionSchema = gameListActionSchema.extend({
  position: z.coerce.number().int().min(1).max(3),
});
