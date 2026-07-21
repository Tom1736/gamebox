import Link from "next/link";
import { ArrowLeft, Ghost } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 text-center">
      <div>
        <Ghost className="mx-auto size-12 text-lime-300" />
        <p className="mt-5 section-kicker">404 · Secret level</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Nothing spawned here.</h1>
        <p className="mt-3 text-white/45">The page you were looking for doesn’t exist.</p>
        <Link href="/" className={cn(buttonVariants(), "mt-7 bg-lime-300 font-bold text-slate-950 hover:bg-lime-200")}>
          <ArrowLeft /> Back home
        </Link>
      </div>
    </main>
  );
}
