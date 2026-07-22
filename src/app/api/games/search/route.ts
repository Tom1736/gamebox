import { NextRequest } from "next/server";
import { searchGames } from "@/lib/igdb";
import { consumeRateLimit } from "@/lib/rate-limit";
import { gameSearchSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const clientAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateLimit = consumeRateLimit({
    key: `game-search:${clientAddress}`,
    limit: 12,
    windowMs: 10_000,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many searches. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const parsed = gameSearchSchema.safeParse(request.nextUrl.searchParams.get("q") ?? "");
  if (!parsed.success) {
    return Response.json({ error: "Invalid search." }, { status: 400 });
  }

  const games = await searchGames(parsed.data);
  return Response.json(
    { games },
    { headers: { "Cache-Control": "private, max-age=60" } },
  );
}
