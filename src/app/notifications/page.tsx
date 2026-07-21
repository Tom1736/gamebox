import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CheckCheck, UserPlus } from "lucide-react";
import { markNotificationsReadAction } from "@/app/actions/friends";
import { ReviewCard } from "@/components/review-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { getFriendReviews } from "@/lib/data";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Activity" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const reviews = await getFriendReviews(user.id);

  return (
    <main className="page-shell">
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="section-kicker">From your friends</p>
            <h1 className="mt-2 flex items-center gap-3 text-4xl font-black tracking-[-0.05em] text-white">
              <Bell className="size-8 text-lime-300" /> Activity
            </h1>
          </div>
          {reviews.length ? (
            <form action={markNotificationsReadAction}>
              <Button type="submit" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                <CheckCheck /> Mark all seen
              </Button>
            </form>
          ) : null}
        </div>

        {reviews.length ? (
          <div className="mt-8 space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-white/10 px-6 py-20 text-center">
            <UserPlus className="mx-auto size-10 text-white/25" />
            <h2 className="mt-5 text-xl font-bold text-white">Your activity feed is quiet.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">Add a few friends and their new ratings and reviews will show up here.</p>
            <Link href="/users" className={cn(buttonVariants(), "mt-6 bg-lime-300 font-bold text-slate-950 hover:bg-lime-200")}>Find friends</Link>
          </div>
        )}
      </section>
    </main>
  );
}
