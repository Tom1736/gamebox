import Link from "next/link";
import { ArrowRight, Sparkles, Trophy, Users } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { GameCover } from "@/components/game-cover";
import { ReviewCard } from "@/components/review-card";
import { Stars } from "@/components/star-rating";
import { buttonVariants } from "@/components/ui/button";
import { getHighestRatedGames, getRecentReviews } from "@/lib/data";
import { getPopularGames } from "@/lib/igdb";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function Home() {
  const [games, reviews, user, highestRated] = await Promise.all([
    getPopularGames(),
    getRecentReviews(4),
    getCurrentUser(),
    getHighestRatedGames(10),
  ]);
  const featured = games[0];

  return (
    <main className="overflow-hidden">
      <section className="relative border-b border-white/8">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/8 px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-lime-300 uppercase">
              <Sparkles className="size-3.5" /> Your games, your people
            </div>
            <h1 className="font-heading text-5xl leading-[.95] font-black tracking-[-0.065em] text-balance text-white sm:text-7xl">
              Every game leaves a <span className="text-lime-300">story.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
              Keep a record of what you play, rate the unforgettable ones, and see what your friends can’t stop talking about.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={user ? "/games" : "/register"}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 bg-lime-300 px-5 font-bold text-slate-950 hover:bg-lime-200",
                )}
              >
                {user ? "Find your next game" : "Start your game log"} <ArrowRight />
              </Link>
              <Link
                href="/users"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 border-white/10 bg-white/5 px-5 text-white hover:bg-white/10",
                )}
              >
                <Users /> Find friends
              </Link>
            </div>
            <p className="mt-5 text-xs text-white/30">No email. No algorithms. Just games.</p>
          </div>

          {featured ? (
            <div className="relative mx-auto w-full max-w-lg lg:mr-0">
              <div className="absolute top-8 -right-7 h-[78%] w-[48%] rotate-6 rounded-2xl bg-gradient-to-b from-fuchsia-500/30 to-violet-800/10 blur-[1px]" />
              <Link
                href={`/games/${featured.id}`}
                className="group relative grid grid-cols-[minmax(145px,210px)_1fr] items-end gap-6 rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-md"
              >
                <GameCover
                  id={featured.id}
                  name={featured.name}
                  coverUrl={featured.coverUrl}
                  priority
                  sizes="210px"
                  className="-mt-12"
                />
                <div className="pb-2">
                  <p className="text-[10px] font-bold tracking-[.16em] text-lime-300 uppercase">Popular pick</p>
                  <h2 className="mt-2 text-xl leading-tight font-bold text-white group-hover:text-lime-300">
                    {featured.name}
                  </h2>
                  <p className="mt-2 line-clamp-4 text-xs leading-5 text-white/45">
                    {featured.summary}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-white/65">
                    View game <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="section-kicker">Trending with players</p>
            <h2 className="section-title">Popular right now</h2>
          </div>
          <Link href="/games" className="hidden items-center gap-1 text-sm font-bold text-white/50 hover:text-lime-300 sm:flex">
            Browse all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-6">
          {games.slice(0, 6).map((game, index) => (
            <GameCard key={game.id} game={game} priority={index < 2} />
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.018]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div>
            <p className="section-kicker">Rated by your crew</p>
            <h2 className="section-title flex items-center gap-3"><Trophy className="size-7 text-lime-300" /> Gamelog top 10</h2>
          </div>
          {highestRated.length ? (
            <ol className="mt-8 grid gap-3 md:grid-cols-2">
              {highestRated.map((game, index) => (
                <li key={game.id}>
                  <Link
                    href={`/games/${game.id}`}
                    className="group grid grid-cols-[2rem_52px_1fr_auto] items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 hover:border-lime-300/20 hover:bg-white/[0.05]"
                  >
                    <span className="text-center text-lg font-black text-white/25">{index + 1}</span>
                    <GameCover id={game.id} name={game.name} coverUrl={game.coverUrl} sizes="52px" className="rounded-md" />
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-white group-hover:text-lime-300">{game.name}</h3>
                      <p className="mt-1 text-xs text-white/35">{game.reviewCount} {game.reviewCount === 1 ? "rating" : "ratings"}</p>
                    </div>
                    <div className="text-right">
                      <Stars rating={game.averageRating} />
                      <p className="mt-1 text-xs font-black text-white">{game.averageRating.toFixed(1)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-white/40">
              The leaderboard will appear after the first rating.
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="section-kicker">Fresh from the crew</p>
              <h2 className="section-title">Latest reviews</h2>
            </div>
            <Link href="/users" className="hidden items-center gap-1 text-sm font-bold text-white/50 hover:text-lime-300 sm:flex">
              Meet players <ArrowRight className="size-4" />
            </Link>
          </div>
          {reviews.length ? (
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} compact />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
              <p className="font-semibold text-white">The log is waiting for its first review.</p>
              <p className="mt-2 text-sm text-white/40">Pick a game, leave a rating, and start the conversation.</p>
              <Link href="/games" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-lime-300">
                Browse games <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Gamelog — made for a small, opinionated group of friends.</p>
        <p>Game data provided by IGDB.</p>
      </footer>
    </main>
  );
}
