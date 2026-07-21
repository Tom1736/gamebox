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
    .int()
    .min(1, "Choose at least one star.")
    .max(5, "Ratings cannot exceed five stars."),
  body: z
    .string()
    .trim()
    .max(2000, "Keep your review under 2,000 characters."),
});

export const gameSearchSchema = z.string().trim().max(80);
