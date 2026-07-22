"use client";

import { useActionState, useEffect, useRef } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { addCommentAction, type CommentActionState } from "@/app/actions/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const initialState: CommentActionState = {};

export function CommentForm({ reviewId }: { reviewId: string }) {
  const [state, formAction, pending] = useActionState(addCommentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 space-y-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <Textarea
        name="body"
        rows={2}
        maxLength={500}
        required
        placeholder="Reply to this review…"
        className="min-h-20 resize-y border-white/10 bg-black/20 text-white placeholder:text-white/25"
      />
      {state.fieldErrors?.body?.map((error) => (
        <p key={error} className="text-xs text-rose-300">{error}</p>
      ))}
      {state.error ? <p className="text-xs text-rose-300">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-lime-300">{state.success}</p> : null}
      <Button
        type="submit"
        size="sm"
        disabled={pending}
        className="bg-white/10 text-white hover:bg-white/15"
      >
        {pending ? <LoaderCircle className="animate-spin" /> : <Send />}
        Comment
      </Button>
    </form>
  );
}
