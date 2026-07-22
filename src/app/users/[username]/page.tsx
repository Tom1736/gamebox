import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bookmark, CalendarDays, Gamepad2, Settings, Star, Users } from "lucide-react";
import { FriendButton } from "@/components/friend-button";
import { GameCover } from "@/components/game-cover";
import { ReviewCard } from "@/components/review-card";
import { UserAvatar } from "@/components/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import { getUserProfile, type ProfileReviewSort } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ sort?: string | string[] }>;
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const username = decodeURIComponent((await params).username).toLowerCase();
  return { title: `@${username}` };
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const username = decodeURIComponent((await params).username).toLowerCase();
  const rawSort = (await searchParams).sort;
  const sort: ProfileReviewSort = (Array.isArray(rawSort) ? rawSort[0] : rawSort) === "rating" ? "rating" : "date";
  const [profile, viewer] = await Promise.all([getUserProfile(username, sort), getCurrentUser()]);
  if (!profile) notFound();

  const friendship = viewer && viewer.id !== profile.id
    ? await prisma.friendship.findUnique({
        where: { userId_friendId: { userId: viewer.id, friendId: profile.id } },
        select: { userId: true },
      })
    : null;
  const average = profile.reviews.length
    ? profile.reviews.reduce((total, review) => total + review.rating, 0) / profile.reviews.length
    : null;
  const isOwner = viewer?.id === profile.id;

  return (
    <main className="page-shell">
      <section className="border-b border-white/8 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,.13),transparent_42%)]">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-14 text-center sm:px-6">
          <UserAvatar
            username={profile.username}
            hasAvatar={Boolean(profile.avatarUpdatedAt)}
            className="size-24 shadow-2xl ring-4 ring-white/10"
            fallbackClassName="text-4xl"
          />
          <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] text-white">@{profile.username}</h1>
          {profile.bio ? (
            <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-white/55">{profile.bio}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm text-white/42">
            <span className="flex items-center gap-1.5"><Gamepad2 className="size-4" /> {profile._count.reviews} reviews</span>
            <Link href={`/users/${profile.username}/friends`} className="flex items-center gap-1.5 hover:text-lime-300">
              <Users className="size-4" /> {profile._count.friends} {profile._count.friends === 1 ? "friend" : "friends"}
            </Link>
            <span className="flex items-center gap-1.5"><Bookmark className="size-4" /> {profile._count.wishlist} wishlist</span>
            {average !== null ? <span className="flex items-center gap-1.5"><Star className="size-4 fill-lime-300 text-lime-300" /> {average.toFixed(1)} average</span> : null}
            <span className="flex items-center gap-1.5"><CalendarDays className="size-4" /> Joined {new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(profile.createdAt)}</span>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {viewer && !isOwner ? <FriendButton username={profile.username} isFriend={Boolean(friendship)} /> : null}
            {isOwner ? (
              <Link
                href="/settings/profile"
                className={cn(buttonVariants({ variant: "outline" }), "border-white/10 bg-white/5 text-white hover:bg-white/10")}
              >
                <Settings /> Edit profile
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
        <p className="section-kicker">Personal podium</p>
        <h2 className="section-title">Top 3 favorite games</h2>
        {profile.favoriteGames.length ? (
          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((position) => {
              const favorite = profile.favoriteGames.find((item) => item.position === position);
              return favorite ? (
                <Link
                  key={position}
                  href={`/games/${favorite.game.id}`}
                  className="group grid grid-cols-[72px_1fr] items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-3 hover:border-lime-300/25"
                >
                  <GameCover id={favorite.game.id} name={favorite.game.name} coverUrl={favorite.game.coverUrl} sizes="72px" className="rounded-lg" />
                  <div className="min-w-0">
                    <span className="text-xs font-black text-lime-300">#{position}</span>
                    <h3 className="mt-1 line-clamp-2 font-bold text-white group-hover:text-lime-300">{favorite.game.name}</h3>
                  </div>
                </Link>
              ) : (
                <div key={position} className="flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-white/8 text-sm text-white/25">
                  #{position} is open
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center">
            <p className="font-semibold text-white">No favorites picked yet.</p>
            <p className="mt-1 text-sm text-white/40">
              {isOwner ? "Open any game to assign it to your top three." : "Their podium is waiting for a first pick."}
            </p>
            {isOwner ? <Link href="/games" className="mt-4 inline-block text-sm font-bold text-lime-300">Find a favorite</Link> : null}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Play next</p>
            <h2 className="section-title">Wishlist</h2>
          </div>
          <span className="text-sm text-white/35">{profile.wishlist.length} games</span>
        </div>
        {profile.wishlist.length ? (
          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
            {profile.wishlist.map((entry) => (
              <Link key={entry.gameId} href={`/games/${entry.game.id}`} className="group min-w-0">
                <GameCover id={entry.game.id} name={entry.game.name} coverUrl={entry.game.coverUrl} />
                <h3 className="mt-3 truncate font-semibold text-white group-hover:text-lime-300">{entry.game.name}</h3>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-dashed border-white/10 py-10 text-center text-sm text-white/40">
            {isOwner ? "Add games to your wishlist from any game page." : "Nothing on the wishlist yet."}
          </div>
        )}
      </section>

      <section id="reviews" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Game diary</p>
            <h2 className="section-title">{profile.username}&apos;s reviews</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/35">Sort by</span>
            <Link
              href={`/users/${profile.username}?sort=date#reviews`}
              className={cn("rounded-lg px-3 py-1.5 font-semibold", sort === "date" ? "bg-lime-300 text-slate-950" : "bg-white/5 text-white/55 hover:text-white")}
            >
              Date reviewed
            </Link>
            <Link
              href={`/users/${profile.username}?sort=rating#reviews`}
              className={cn("rounded-lg px-3 py-1.5 font-semibold", sort === "rating" ? "bg-lime-300 text-slate-950" : "bg-white/5 text-white/55 hover:text-white")}
            >
              Stars
            </Link>
          </div>
        </div>
        {profile.reviews.length ? (
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {profile.reviews.map((review) => (
              <ReviewCard
                key={review.id}
                compact
                review={{
                  ...review,
                  user: { username: profile.username, avatarUpdatedAt: profile.avatarUpdatedAt },
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <p className="font-semibold text-white">No reviews yet</p>
            <p className="mt-1 text-sm text-white/40">Their game diary is still a blank page.</p>
          </div>
        )}
      </section>
    </main>
  );
}
