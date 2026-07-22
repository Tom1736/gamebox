import Link from "next/link";
import {
  Bell,
  Gamepad2,
  LogOut,
  Search,
  Users,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { getUnreadNotificationCount } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const unread = user
    ? await getUnreadNotificationCount(user.id, user.lastNotificationCheckAt)
    : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#080b12]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-auto flex items-center gap-2.5 text-white">
          <span className="flex size-9 items-center justify-center rounded-xl bg-lime-300 text-slate-950 shadow-[0_0_30px_rgba(190,242,100,.18)]">
            <Gamepad2 className="size-5" strokeWidth={2.4} />
          </span>
          <span className="font-heading text-lg font-black tracking-[-0.04em]">GAMELOG</span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-1">
          <Link
            href="/games"
            aria-label="Games"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-white/60 hover:bg-white/5 hover:text-white",
            )}
          >
            <Search /> <span className="hidden sm:inline">Games</span>
          </Link>
          <Link
            href="/users"
            aria-label="People"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-white/60 hover:bg-white/5 hover:text-white",
            )}
          >
            <Users /> <span className="hidden sm:inline">People</span>
          </Link>
          {user ? (
            <>
              <Link
                href="/notifications"
                aria-label={`Activity${unread ? `, ${unread} unread` : ""}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "relative text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <Bell /> <span className="hidden sm:inline">Activity</span>
                {unread ? (
                  <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-lime-300 px-1 text-[9px] leading-4 font-black text-slate-950">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>
              <Link
                href={`/users/${user.username}`}
                className="ml-1 rounded-full outline-none ring-offset-2 ring-offset-[#080b12] hover:ring-2 hover:ring-lime-300/50 focus-visible:ring-2 focus-visible:ring-lime-300"
                aria-label="Your profile"
              >
                <UserAvatar username={user.username} hasAvatar={Boolean(user.avatarUpdatedAt)} className="size-8" />
              </Link>
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Sign out"
                  className="text-white/35 hover:bg-white/5 hover:text-white"
                >
                  <LogOut />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden text-white/65 hover:bg-white/5 hover:text-white sm:inline-flex",
                )}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-lime-300 font-bold text-slate-950 hover:bg-lime-200",
                )}
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
