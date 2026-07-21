import { describe, expect, it } from "vitest";
import { authSchema, reviewSchema, usernameSchema } from "./validation";

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
  it("accepts the complete one-to-five rating range", () => {
    for (let rating = 1; rating <= 5; rating += 1) {
      expect(
        reviewSchema.safeParse({ gameId: 121, rating, body: "Good game" })
          .success,
      ).toBe(true);
    }
  });

  it("rejects ratings outside the supported range", () => {
    expect(
      reviewSchema.safeParse({ gameId: 121, rating: 0, body: "" }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({ gameId: 121, rating: 6, body: "" }).success,
    ).toBe(false);
  });

  it("rejects reviews over 2,000 characters", () => {
    expect(
      reviewSchema.safeParse({
        gameId: 121,
        rating: 5,
        body: "a".repeat(2001),
      }).success,
    ).toBe(false);
  });
});
