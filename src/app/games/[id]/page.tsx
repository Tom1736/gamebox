import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Gamepad2, MessageSquareText, Star } from "lucide-react";
import { GameCover } from "@/components/game-cover";
import { ReviewForm } from "@/components/review-form";
import { Stars } from "@/components/star-rating";
import { buttonVariants } from "@/components/ui/button";
import { getGameReviews } from "@/lib/data";
import { getGame } from "@/lib/igdb";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

type GamePageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const game = await getGame(Number((await params).id));
  return game
    ? { title: game.name, description: game.summary ?? `Reviews for ${game.name}` }
    : { title: "Game not found" };
}

export default async function GamePage({ params }: GamePageProps) {
  const gameId = Number((await params).id);
  if (!Number.isInteger(gameId) || gameId <= 0) notFound();

  const game = await getGame(gameId);
  if (!game) notFound();

  const [reviews, user] = await Promise.all([
    getGameReviews(gameId),
    getCurrentUser(),
  ]);
  const existingReview = user
    ? await prisma.review.findUnique({
        where: { userId_gameId: { userId: user.id, gameId } },
        select: { rating: true, body: true },
      })
    : null;
  const average = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : null;
  const year = game.releaseDate ? new Date(game.releaseDate).getUTCFullYear() : null;

  return (
    <main className="page-shell">
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_5%,rgba(167,139,250,.15),transparent_38%),radial-gradient(circle_at_10%_90%,rgba(190,242,100,.08),transparent_35%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-9 px-4 py-14 sm:px-6 md:grid-cols-[230px_1fr] lg:px-8 lg:py-20">
          <GameCover
            id={game.id}
            name={game.name}
            coverUrl={game.coverUrl}
            priority
            sizes="230px"
            className="w-full max-w-[230px]"
          />
          <div className="self-end">
            <div className="flex flex-wrap gap-2">
              {game.genres.map((genre) => (
                <span key={genre} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/55">
                  {genre}
                </span>
              ))}
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl leading-[1.02] font-black tracking-[-0.055em] text-white sm:text-6xl">
              {game.name}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/45">
              {year ? <span className="flex items-center gap-1.5"><CalendarDays className="size-4" /> {year}</span> : null}
              {game.platforms.length ? <span className="flex items-center gap-1.5"><Gamepad2 className="size-4" /> {game.platforms.slice(0, 3).join(", ")}</span> : null}
            </div>
            {game.summary ? <p className="mt-6 max-w-3xl text-base leading-7 text-white/58">{game.summary}</p> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] font-bold tracking-wider text-white/35 uppercase">Gamebox</p>
                <div className="mt-1 flex items-center gap-2">
                  {average ? <Stars rating={average} /> : <span className="text-sm text-white/35">Not rated yet</span>}
                  {average ? <span className="text-sm font-bold text-white">{average.toFixed(1)}</span> : null}
                </div>
              </div>
              {game.rating ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold tracking-wider text-white/35 uppercase">IGDB score</p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-bold text-white"><Star className="size-4 fill-violet-300 text-violet-300" /> {Math.round(game.rating)} / 100</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <div>
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="section-kicker">The verdicts</p>
              <h2 className="section-title">Community reviews</h2>
            </div>
            <span className="flex items-center gap-1.5 text-sm text-white/35"><MessageSquareText className="size-4" /> {reviews.length}</span>
          </div>
          {reviews.length ? (
            <div className="mt-7 space-y-4">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-white/8 bg-white/[0.035] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={`/users/${review.user.username}`} className="font-bold text-white hover:text-lime-300">@{review.user.username}</Link>
                    <Stars rating={review.rating} />
                  </div>
                  {review.body ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/65">{review.body}</p> : <p className="mt-4 text-sm text-white/30 italic">Rated without a written review.</p>}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border border-dashed border-white/10 py-14 text-center">
              <p className="font-semibold text-white">No reviews yet</p>
              <p className="mt-1 text-sm text-white/40">Be the first to leave your take.</p>
            </div>
          )}
        </div>
        <aside>
          {user ? (
            <ReviewForm gameId={game.id} existingReview={existingReview} />
          ) : (
            <div className="rounded-2xl border border-lime-300/15 bg-lime-300/[0.055] p-6">
              <p className="section-kicker">Your turn</p>
              <h2 className="mt-2 text-xl font-bold text-white">Played this one?</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">Sign in to add a star rating and share your review.</p>
              <Link href="/login" className={cn(buttonVariants(), "mt-5 bg-lime-300 font-bold text-slate-950 hover:bg-lime-200")}>Sign in to review</Link>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
