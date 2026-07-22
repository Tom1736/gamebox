import { beforeEach, describe, expect, it, vi } from "vitest";
import { consumeRateLimit, resetRateLimitsForTests } from "./rate-limit";

describe("consumeRateLimit", () => {
  beforeEach(() => {
    resetRateLimitsForTests();
    vi.useRealTimers();
  });

  it("allows requests through the configured limit", () => {
    expect(consumeRateLimit({ key: "player", limit: 2, windowMs: 1000 }).allowed).toBe(true);
    expect(consumeRateLimit({ key: "player", limit: 2, windowMs: 1000 }).allowed).toBe(true);
    expect(consumeRateLimit({ key: "player", limit: 2, windowMs: 1000 }).allowed).toBe(false);
  });

  it("uses independent keys", () => {
    consumeRateLimit({ key: "one", limit: 1, windowMs: 1000 });
    expect(consumeRateLimit({ key: "two", limit: 1, windowMs: 1000 }).allowed).toBe(true);
  });

  it("resets after the time window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T12:00:00Z"));
    consumeRateLimit({ key: "player", limit: 1, windowMs: 1000 });
    expect(consumeRateLimit({ key: "player", limit: 1, windowMs: 1000 }).allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(consumeRateLimit({ key: "player", limit: 1, windowMs: 1000 }).allowed).toBe(true);
  });
});
