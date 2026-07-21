import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GameCover } from "@/components/game-cover";
import { Stars } from "@/components/star-rating";
import type { GameSummary } from "@/lib/igdb";

export function GameCard({ game, priority = false }: { game: GameSummary; priority?: boolean }) {
  const year = game.releaseDate ? new Date(game.releaseDate).getUTCFullYear() : null;

  return (
    <Link
      href={`/games/${game.id}`}
      className="group block min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#080b12]"
    >
      <GameCover
        id={game.id}
        name={game.name}
        coverUrl={game.coverUrl}
        priority={priority}
      />
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white transition group-hover:text-lime-300">
            {game.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-white/45">
            {[year, game.genres[0]].filter(Boolean).join(" · ") || "Video game"}
          </p>
        </div>
        <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-white/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime-300" />
      </div>
      {game.rating ? (
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={game.rating / 20} />
          <span className="text-[11px] font-medium text-white/35">IGDB</span>
        </div>
      ) : null}
    </Link>
  );
}
