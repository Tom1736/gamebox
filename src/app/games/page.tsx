import type { Metadata } from "next";
import { GameSearch } from "@/components/game-search";
import { getPopularGames } from "@/lib/igdb";

export const metadata: Metadata = { title: "Find games" };

export default async function GamesPage() {
  const games = await getPopularGames();

  return (
    <main className="page-shell">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="section-kicker">The whole backlog</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Find your next obsession.</h1>
          <p className="mt-4 text-white/45">Search IGDB, open a game, and add your own rating and review.</p>
        </div>
        <GameSearch initialGames={games} />
      </section>
    </main>
  );
}
