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
          <span className="font-heading text-lg font-black tracking-[-0.04em]">GAMEBOX</span>
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
                className="ml-1 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-xs font-black text-white ring-2 ring-white/10 transition hover:ring-lime-300/50"
                aria-label="Your profile"
              >
                {user.username[0]?.toUpperCase()}
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
