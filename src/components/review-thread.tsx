import Link from "next/link";
import { Clock3, MessageSquareText, Trash2 } from "lucide-react";
import { deleteCommentAction } from "@/app/actions/comments";
import { CommentForm } from "@/components/comment-form";
import { Stars } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";

type ReviewThreadProps = {
  review: {
    id: string;
    rating: number;
    body: string | null;
    hoursPlayed: number | null;
    createdAt: Date;
    userId: string;
    user: { id: string; username: string; avatarUpdatedAt: Date | null };
    comments: Array<{
      id: string;
      body: string;
      createdAt: Date;
      userId: string;
      user: { id: string; username: string; avatarUpdatedAt: Date | null };
    }>;
  };
  viewer: { id: string } | null;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function ReviewThread({ review, viewer }: ReviewThreadProps) {
  return (
    <article
      id={`review-${review.id}`}
      className="scroll-mt-24 rounded-2xl border border-white/8 bg-white/[0.035] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/users/${review.user.username}`}
          className="flex items-center gap-2.5 font-bold text-white hover:text-lime-300"
        >
          <UserAvatar
            username={review.user.username}
            hasAvatar={Boolean(review.user.avatarUpdatedAt)}
            className="size-8"
          />
          @{review.user.username}
        </Link>
        <Stars rating={review.rating} />
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/35">
        <span>{dateFormatter.format(review.createdAt)}</span>
        {review.hoursPlayed !== null ? (
          <span className="flex items-center gap-1.5">
            <Clock3 className="size-3.5" /> {review.hoursPlayed.toLocaleString()} hours played
          </span>
        ) : null}
      </div>
      {review.body ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/65">{review.body}</p>
      ) : (
        <p className="mt-4 text-sm text-white/30 italic">Rated without a written review.</p>
      )}

      <div className="mt-5 border-t border-white/8 pt-4">
        <p className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-white/40 uppercase">
          <MessageSquareText className="size-3.5" /> {review.comments.length}{" "}
          {review.comments.length === 1 ? "comment" : "comments"}
        </p>
        {review.comments.length ? (
          <div className="mt-3 space-y-3">
            {review.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 rounded-xl bg-black/15 p-3">
                <UserAvatar
                  username={comment.user.username}
                  hasAvatar={Boolean(comment.user.avatarUpdatedAt)}
                  className="mt-0.5 size-7"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Link
                      href={`/users/${comment.user.username}`}
                      className="text-xs font-bold text-white hover:text-lime-300"
                    >
                      @{comment.user.username}
                    </Link>
                    <span className="text-[11px] text-white/30">{dateFormatter.format(comment.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-white/60">{comment.body}</p>
                </div>
                {viewer?.id === comment.userId ? (
                  <form action={deleteCommentAction}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <Button type="submit" variant="ghost" size="icon-sm" aria-label="Delete comment" className="text-white/25 hover:text-rose-300">
                      <Trash2 />
                    </Button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        {viewer && viewer.id !== review.userId ? <CommentForm reviewId={review.id} /> : null}
        {!viewer ? (
          <Link href="/login" className="mt-4 inline-block text-xs font-semibold text-lime-300 hover:text-lime-200">
            Sign in to join the conversation
          </Link>
        ) : null}
      </div>
    </article>
  );
}
