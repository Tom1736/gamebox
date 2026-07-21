import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Gamepad2, Star, Users } from "lucide-react";
import { FriendButton } from "@/components/friend-button";
import { ReviewCard } from "@/components/review-card";
import { getUserProfile } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type ProfilePageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const username = decodeURIComponent((await params).username).toLowerCase();
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const username = decodeURIComponent((await params).username).toLowerCase();
  const [profile, viewer] = await Promise.all([getUserProfile(username), getCurrentUser()]);
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

  return (
    <main className="page-shell">
      <section className="border-b border-white/8 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,.13),transparent_42%)]">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-14 text-center sm:px-6">
          <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 text-4xl font-black text-white shadow-2xl ring-4 ring-white/10">
            {profile.username[0]?.toUpperCase()}
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] text-white">@{profile.username}</h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm text-white/42">
            <span className="flex items-center gap-1.5"><Gamepad2 className="size-4" /> {profile._count.reviews} reviews</span>
            <span className="flex items-center gap-1.5"><Users className="size-4" /> {profile._count.friends} friends</span>
            {average ? <span className="flex items-center gap-1.5"><Star className="size-4 fill-lime-300 text-lime-300" /> {average.toFixed(1)} average</span> : null}
            <span className="flex items-center gap-1.5"><CalendarDays className="size-4" /> Joined {new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(profile.createdAt)}</span>
          </div>
          {viewer && viewer.id !== profile.id ? <div className="mt-6"><FriendButton username={profile.username} isFriend={Boolean(friendship)} /></div> : null}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div>
          <p className="section-kicker">Game diary</p>
          <h2 className="section-title">{profile.username}&apos;s reviews</h2>
        </div>
        {profile.reviews.length ? (
          <div className="mt-7 space-y-4">
            {profile.reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={{ ...review, user: { username: profile.username } }}
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
