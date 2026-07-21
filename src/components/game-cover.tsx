import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

const fallbackGradients = [
  "from-violet-600 via-fuchsia-500 to-orange-400",
  "from-emerald-600 via-teal-500 to-cyan-400",
  "from-blue-700 via-indigo-500 to-pink-400",
  "from-amber-500 via-orange-500 to-rose-600",
  "from-lime-500 via-emerald-500 to-cyan-600",
];

type GameCoverProps = {
  id: number;
  name: string;
  coverUrl?: string | null;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function GameCover({
  id,
  name,
  coverUrl,
  className,
  priority = false,
  sizes = "(max-width: 768px) 45vw, 220px",
}: GameCoverProps) {
  return (
    <div
      className={cn(
        "relative isolate aspect-[3/4] overflow-hidden rounded-xl bg-slate-900 shadow-[0_18px_45px_rgba(0,0,0,.32)] ring-1 ring-white/10",
        className,
      )}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={`${name} cover`}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between bg-gradient-to-br p-4",
            fallbackGradients[Math.abs(id) % fallbackGradients.length],
          )}
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm">
            <Gamepad2 className="size-5 text-white" />
          </div>
          <p className="font-heading text-xl leading-tight font-black tracking-[-0.04em] text-white text-shadow-sm">
            {name}
          </p>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />
    </div>
  );
}
