import { describe, expect, it } from "vitest";
import {
  authSchema,
  commentSchema,
  profileSchema,
  reviewSchema,
  usernameSchema,
} from "./validation";

describe("usernameSchema", () => {
  it("normalizes valid usernames", () => {
    expect(usernameSchema.parse("  Player_ONE ")).toBe("player_one");
  });

  it("rejects whitespace and punctuation", () => {
    expect(usernameSchema.safeParse("player one").success).toBe(false);
    expect(usernameSchema.safeParse("player!").success).toBe(false);
  });
});

describe("authSchema", () => {
  it("requires a six-character password", () => {
    expect(
      authSchema.safeParse({ username: "player", password: "short" }).success,
    ).toBe(false);
    expect(
      authSchema.safeParse({ username: "player", password: "longer" }).success,
    ).toBe(true);
  });
});

describe("reviewSchema", () => {
  it("accepts the complete half-to-five rating range", () => {
    for (let rating = 0.5; rating <= 5; rating += 0.5) {
      expect(
        reviewSchema.safeParse({
          gameId: 121,
          rating,
          body: "Good game",
          hoursPlayed: "12.5",
        })
          .success,
      ).toBe(true);
    }
  });

  it("rejects ratings outside the supported range", () => {
    expect(
      reviewSchema.safeParse({ gameId: 121, rating: 0, body: "", hoursPlayed: "" }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({ gameId: 121, rating: 6, body: "", hoursPlayed: "" }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({ gameId: 121, rating: 3.25, body: "", hoursPlayed: "" }).success,
    ).toBe(false);
  });

  it("rejects reviews over 2,000 characters", () => {
    expect(
      reviewSchema.safeParse({
        gameId: 121,
        rating: 5,
        body: "a".repeat(2001),
        hoursPlayed: "",
      }).success,
    ).toBe(false);
  });
});

describe("profileSchema", () => {
  it("accepts an optional description up to 500 characters", () => {
    expect(profileSchema.safeParse({ bio: "Co-op fan", removeAvatar: false }).success).toBe(true);
    expect(profileSchema.safeParse({ bio: "a".repeat(501), removeAvatar: false }).success).toBe(false);
  });
});

describe("commentSchema", () => {
  it("requires a non-empty comment with a valid review id", () => {
    const reviewId = "cm12345678901234567890123";
    expect(commentSchema.safeParse({ reviewId, body: "I agree!" }).success).toBe(true);
    expect(commentSchema.safeParse({ reviewId, body: "   " }).success).toBe(false);
  });
});
