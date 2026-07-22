"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  loginAction,
  registerAction,
  type AuthActionState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {state.error ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {state.error}
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="player_one"
          required
          className="h-11 border-white/10 bg-white/5 px-3 text-white placeholder:text-white/25"
          aria-invalid={Boolean(state.fieldErrors?.username)}
        />
        {state.fieldErrors?.username?.map((error) => (
          <p key={error} className="text-xs text-rose-300">
            {error}
          </p>
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          placeholder="••••••••"
          required
          className="h-11 border-white/10 bg-white/5 px-3 text-white placeholder:text-white/25"
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
        {state.fieldErrors?.password?.map((error) => (
          <p key={error} className="text-xs text-rose-300">
            {error}
          </p>
        ))}
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full bg-lime-300 font-bold text-slate-950 hover:bg-lime-200"
      >
        {pending ? <LoaderCircle className="animate-spin" /> : null}
        {isLogin ? "Sign in" : "Create account"}
      </Button>
      <p className="text-center text-sm text-white/45">
        {isLogin ? "New around here?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-semibold text-lime-300 hover:text-lime-200"
        >
          {isLogin ? "Join Gamelog" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
