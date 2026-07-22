"use client";

import { useActionState } from "react";
import { ImageUp, LoaderCircle } from "lucide-react";
import { saveProfileAction, type ProfileActionState } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: ProfileActionState = {};

export function ProfileForm({ bio, hasAvatar }: { bio: string | null; hasAvatar: boolean }) {
  const [state, formAction, pending] = useActionState(saveProfileAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5" encType="multipart/form-data">
      <div>
        <label htmlFor="avatar" className="mb-2 block text-sm font-medium text-white">Profile picture</label>
        <Input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="h-auto border-white/10 bg-white/5 py-2 text-white file:mr-3 file:rounded-md file:border-0 file:bg-lime-300 file:px-3 file:py-1.5 file:font-semibold file:text-slate-950"
        />
        <p className="mt-2 text-xs text-white/35">JPEG, PNG, WebP, or GIF. Maximum 1 MB.</p>
        {hasAvatar ? (
          <label className="mt-3 flex items-center gap-2 text-sm text-white/55">
            <input type="checkbox" name="removeAvatar" className="accent-lime-300" /> Remove current picture
          </label>
        ) : null}
      </div>
      <div>
        <label htmlFor="bio" className="mb-2 block text-sm font-medium text-white">About you</label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio ?? ""}
          rows={6}
          maxLength={500}
          placeholder="What do you play? What makes a game unforgettable for you?"
          className="resize-y border-white/10 bg-white/5 text-white placeholder:text-white/25"
        />
        {state.fieldErrors?.bio?.map((error) => (
          <p key={error} className="mt-2 text-xs text-rose-300">{error}</p>
        ))}
      </div>
      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-lime-300">{state.success}</p> : null}
      <Button type="submit" disabled={pending} className="bg-lime-300 font-bold text-slate-950 hover:bg-lime-200">
        {pending ? <LoaderCircle className="animate-spin" /> : <ImageUp />}
        Save profile
      </Button>
    </form>
  );
}
