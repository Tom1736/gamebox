import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <p className="section-kicker">Welcome back</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.045em] text-white">Pick up where you left off.</h1>
        <p className="mt-3 text-sm leading-6 text-white/45">Sign in with the username and password you chose. Nothing else required.</p>
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
