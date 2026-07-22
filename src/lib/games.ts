import type { GameSummary } from "@/lib/igdb";

export function gameUpsertData(game: GameSummary) {
  return {
    slug: game.slug,
    name: game.name,
    summary: game.summary,
    coverUrl: game.coverUrl,
    releaseDate: game.releaseDate ? new Date(game.releaseDate) : null,
    genres: game.genres,
    platforms: game.platforms,
    igdbRating: game.rating,
    popularity: game.popularity,
  };
}
