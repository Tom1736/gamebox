import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Join" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <p className="section-kicker">Join the party</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.045em] text-white">Your game log starts here.</h1>
        <p className="mt-3 text-sm leading-6 text-white/45">Choose a username and password. We don’t need your email or anything else.</p>
        <AuthForm mode="register" />
      </div>
    </main>
  );
}
