import { NextRequest } from "next/server";
import { searchGames } from "@/lib/igdb";
import { gameSearchSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
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
