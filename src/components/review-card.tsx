import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { GameCover } from "@/components/game-cover";
import { Stars } from "@/components/star-rating";

type ReviewCardProps = {
  review: {
    rating: number;
    body: string | null;
    createdAt: Date | string;
    updatedAt?: Date | string;
    user: { username: string };
    game: {
      id: number;
      name: string;
      coverUrl: string | null;
      releaseDate?: Date | string | null;
      genres?: string[];
    };
  };
  compact?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function ReviewCard({ review, compact = false }: ReviewCardProps) {
  return (
    <article className="group grid grid-cols-[72px_1fr] gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4 transition hover:border-white/15 hover:bg-white/[0.055] sm:grid-cols-[88px_1fr]">
      <Link href={`/games/${review.game.id}`} className="block">
        <GameCover
          id={review.game.id}
          name={review.game.name}
          coverUrl={review.game.coverUrl}
          className="rounded-lg"
          sizes="88px"
        />
      </Link>
      <div className="min-w-0 py-0.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/games/${review.game.id}`}
              className="font-semibold text-white hover:text-lime-300"
            >
              {review.game.name}
            </Link>
            <p className="mt-1 text-xs text-white/40">
              by{" "}
              <Link
                className="font-medium text-white/65 hover:text-white"
                href={`/users/${review.user.username}`}
              >
                @{review.user.username}
              </Link>
              {" · "}
              {dateFormatter.format(new Date(review.createdAt))}
            </p>
          </div>
          <Stars rating={review.rating} />
        </div>
        {review.body ? (
          <p
            className={
              compact
                ? "mt-3 line-clamp-3 text-sm leading-6 text-white/65"
                : "mt-3 whitespace-pre-wrap text-sm leading-6 text-white/70"
            }
          >
            {review.body}
          </p>
        ) : (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-white/30 italic">
            <MessageSquareText className="size-3.5" /> Rated without a written review
          </p>
        )}
      </div>
    </article>
  );
}
