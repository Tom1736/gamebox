import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Users } from "lucide-react";
import { FriendButton } from "@/components/friend-button";
import { UserAvatar } from "@/components/user-avatar";
import { getUserFriends } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type FriendsPageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: FriendsPageProps): Promise<Metadata> {
  const username = decodeURIComponent((await params).username).toLowerCase();
  return { title: `@${username}'s friends` };
}

export default async function FriendsPage({ params }: FriendsPageProps) {
  const username = decodeURIComponent((await params).username).toLowerCase();
  const [profile, viewer] = await Promise.all([getUserFriends(username), getCurrentUser()]);
  if (!profile) notFound();

  const viewerFriendships = viewer
    ? await prisma.friendship.findMany({
        where: { userId: viewer.id },
        select: { friendId: true },
      })
    : [];
  const viewerFriendIds = new Set(viewerFriendships.map((friendship) => friendship.friendId));

  return (
    <main className="page-shell">
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <Link href={`/users/${profile.username}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/45 hover:text-lime-300">
          <ArrowLeft className="size-4" /> Back to @{profile.username}
        </Link>
        <div className="mt-8">
          <p className="section-kicker">The crew</p>
          <h1 className="mt-2 flex items-center gap-3 text-4xl font-black tracking-[-0.05em] text-white">
            <Users className="size-8 text-lime-300" /> @{profile.username}&apos;s friends
          </h1>
          <p className="mt-3 text-white/45">{profile.friends.length} {profile.friends.length === 1 ? "person" : "people"}</p>
        </div>

        {profile.friends.length ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {profile.friends.map((friend) => {
              const average = friend.reviews.length
                ? friend.reviews.reduce((total, review) => total + review.rating, 0) / friend.reviews.length
                : null;
              return (
                <article key={friend.id} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <Link href={`/users/${friend.username}`}>
                    <UserAvatar username={friend.username} hasAvatar={Boolean(friend.avatarUpdatedAt)} className="size-12" fallbackClassName="text-lg" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/users/${friend.username}`} className="block truncate font-bold text-white hover:text-lime-300">@{friend.username}</Link>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/38">
                      <span>{friend._count.reviews} {friend._count.reviews === 1 ? "review" : "reviews"}</span>
                      {average !== null ? <span className="flex items-center gap-1"><Star className="size-3 fill-lime-300 text-lime-300" /> {average.toFixed(1)}</span> : null}
                    </div>
                  </div>
                  {viewer && viewer.id !== friend.id ? (
                    <FriendButton username={friend.username} isFriend={viewerFriendIds.has(friend.id)} />
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <p className="font-semibold text-white">No friends added yet.</p>
            <Link href="/users" className="mt-3 inline-block text-sm font-bold text-lime-300">Browse players</Link>
          </div>
        )}
      </section>
    </main>
  );
}
