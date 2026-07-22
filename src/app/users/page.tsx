import type { Metadata } from "next";
import Link from "next/link";
import { Search, Star, Users } from "lucide-react";
import { FriendButton } from "@/components/friend-button";
import { UserAvatar } from "@/components/user-avatar";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { searchUsers } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "People" };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const rawQuery = (await searchParams).q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery ?? "").trim().slice(0, 80);
  const [users, viewer] = await Promise.all([searchUsers(query), getCurrentUser()]);
  const friendships = viewer
    ? await prisma.friendship.findMany({ where: { userId: viewer.id }, select: { friendId: true } })
    : [];
  const friendIds = new Set(friendships.map((friendship) => friendship.friendId));

  return (
    <main className="page-shell">
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="section-kicker">Player directory</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Find your people.</h1>
          <p className="mt-3 text-white/45">Add friends to bring their latest reviews into your activity feed.</p>
        </div>
        <form className="relative mx-auto mt-8 max-w-xl" action="/users">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/35" />
          <Input name="q" defaultValue={query} placeholder="Search by username…" className="h-12 rounded-2xl border-white/10 bg-white/5 pr-4 pl-12 text-white placeholder:text-white/30" />
        </form>

        {users.length ? (
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {users.map((user) => {
              const average = user.reviews.length
                ? user.reviews.reduce((total, review) => total + review.rating, 0) / user.reviews.length
                : null;
              const isViewer = user.id === viewer?.id;
              return (
                <article key={user.id} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <Link href={`/users/${user.username}`}>
                    <UserAvatar username={user.username} hasAvatar={Boolean(user.avatarUpdatedAt)} className="size-12" fallbackClassName="text-lg" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/users/${user.username}`} className="truncate font-bold text-white hover:text-lime-300">@{user.username}</Link>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/38">
                      <span>{user._count.reviews} {user._count.reviews === 1 ? "review" : "reviews"}</span>
                      <span className="flex items-center gap-1"><Users className="size-3" /> {user._count.friends}</span>
                      {average !== null ? <span className="flex items-center gap-1"><Star className="size-3 fill-lime-300 text-lime-300" /> {average.toFixed(1)}</span> : null}
                    </div>
                  </div>
                  {viewer && !isViewer ? <FriendButton username={user.username} isFriend={friendIds.has(user.id)} /> : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <p className="font-semibold text-white">No players found</p>
            <p className="mt-1 text-sm text-white/40">Try a different username.</p>
          </div>
        )}
      </section>
    </main>
  );
}
