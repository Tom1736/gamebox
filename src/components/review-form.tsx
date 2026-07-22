"use client";

import { useActionState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import {
  deleteReviewAction,
  saveReviewAction,
  type ReviewActionState,
} from "@/app/actions/reviews";
import { StarInput } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: ReviewActionState = {};

export function ReviewForm({
  gameId,
  existingReview,
}: {
  gameId: number;
  existingReview?: { rating: number; body: string | null; hoursPlayed: number | null } | null;
}) {
  const [state, formAction, pending] = useActionState(
    saveReviewAction,
    initialState,
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-bold tracking-[0.16em] text-lime-300 uppercase">
          {existingReview ? "Update your take" : "Log this game"}
        </p>
        <h2 className="mt-1 text-xl font-bold text-white">
          {existingReview ? "Edit your review" : "What did you think?"}
        </h2>
      </div>
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="gameId" value={gameId} />
        <StarInput defaultValue={existingReview?.rating} />
        {state.fieldErrors?.rating?.map((error) => (
          <p key={error} className="text-xs text-rose-300">
            {error}
          </p>
        ))}
        <div>
          <label className="mb-2 block text-sm font-medium text-white" htmlFor="hoursPlayed">
            Hours played <span className="font-normal text-white/35">(optional)</span>
          </label>
          <div className="relative max-w-48">
            <Input
              id="hoursPlayed"
              name="hoursPlayed"
              type="number"
              min="0"
              max="100000"
              step="0.1"
              defaultValue={existingReview?.hoursPlayed ?? ""}
              placeholder="42.5"
              className="border-white/10 bg-black/20 pr-14 text-white placeholder:text-white/25"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-white/35">hours</span>
          </div>
          {state.fieldErrors?.hoursPlayed?.map((error) => (
            <p key={error} className="mt-2 text-xs text-rose-300">{error}</p>
          ))}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white" htmlFor="body">
            Review <span className="font-normal text-white/35">(optional)</span>
          </label>
          <Textarea
            id="body"
            name="body"
            defaultValue={existingReview?.body ?? ""}
            rows={5}
            maxLength={2000}
            placeholder="A boss fight you'll never forget? A cozy world you keep returning to?"
            className="min-h-32 resize-y border-white/10 bg-black/20 text-white placeholder:text-white/25"
          />
          {state.fieldErrors?.body?.map((error) => (
            <p key={error} className="mt-2 text-xs text-rose-300">
              {error}
            </p>
          ))}
        </div>
        {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-lime-300">{state.success}</p> : null}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={pending}
            className="h-10 bg-lime-300 px-5 font-bold text-slate-950 hover:bg-lime-200"
          >
            {pending ? <LoaderCircle className="animate-spin" /> : null}
            {existingReview ? "Save changes" : "Publish review"}
          </Button>
        </div>
      </form>
      {existingReview ? (
        <form action={deleteReviewAction} className="mt-3">
          <input type="hidden" name="gameId" value={gameId} />
          <Button type="submit" variant="ghost" className="text-white/40 hover:text-rose-300">
            <Trash2 /> Delete review
          </Button>
        </form>
      ) : null}
    </div>
  );
}
