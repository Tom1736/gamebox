import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProfileForm } from "@/components/profile-form";
import { UserAvatar } from "@/components/user-avatar";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Edit profile" };

export default async function ProfileSettingsPage() {
  const user = await requireUser();
  const profile = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { username: true, bio: true, avatarUpdatedAt: true },
  });

  return (
    <main className="page-shell">
      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <Link href={`/users/${profile.username}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/45 hover:text-lime-300">
          <ArrowLeft className="size-4" /> Back to profile
        </Link>
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <UserAvatar username={profile.username} hasAvatar={Boolean(profile.avatarUpdatedAt)} className="size-16" fallbackClassName="text-2xl" />
            <div>
              <p className="section-kicker">Make it yours</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Edit profile</h1>
            </div>
          </div>
          <ProfileForm bio={profile.bio} hasAvatar={Boolean(profile.avatarUpdatedAt)} />
        </div>
      </section>
    </main>
  );
}
