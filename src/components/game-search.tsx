"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GameSummary } from "@/lib/igdb";

export function GameSearch({ initialGames }: { initialGames: GameSummary[] }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const games = query.trim() ? searchResults : initialGames;

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/games/search?q=${encodeURIComponent(normalized)}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const data = (await response.json()) as { games: GameSummary[] };
          setSearchResults(data.games);
        } else {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          setError(data?.error ?? "Search is temporarily unavailable.");
        }
      } catch (requestError) {
        if (!(requestError instanceof DOMException && requestError.name === "AbortError")) {
          setError("Search is temporarily unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, initialGames]);

  return (
    <div>
      <div className="relative mx-auto max-w-2xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/35" />
        <Input
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (!value.trim()) setLoading(false);
            if (!value.trim()) setError(null);
          }}
          placeholder="Search for a game…"
          aria-label="Search games"
          autoFocus
          className="h-14 rounded-2xl border-white/10 bg-white/5 pr-12 pl-12 text-base text-white shadow-2xl placeholder:text-white/30 focus-visible:border-lime-300/40 focus-visible:ring-lime-300/20"
        />
        {loading ? (
          <LoaderCircle className="absolute top-1/2 right-4 size-5 -translate-y-1/2 animate-spin text-lime-300" />
        ) : query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuery("");
              setLoading(false);
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-white/45"
            aria-label="Clear search"
          >
            <X />
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-rose-300">{error}</p>
      ) : null}

      <div className="mt-10 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-lime-300 uppercase">
            {query ? "Search results" : "Start here"}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            {query ? `Games matching “${query}”` : "Popular right now"}
          </h2>
        </div>
        <p className="hidden text-sm text-white/35 sm:block">
          {games.length} {games.length === 1 ? "game" : "games"}
        </p>
      </div>

      {games.length ? (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} priority={!query.trim() && index < 2} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <p className="font-semibold text-white">No games found</p>
          <p className="mt-1 text-sm text-white/40">Try another title or a shorter search.</p>
        </div>
      )}
    </div>
  );
}
