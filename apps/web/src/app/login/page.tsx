"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { LogoMark } from "@/components/ui/logo-mark";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="blueprint-bg flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-steel-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <LogoMark size={32} />
          <h1 className="text-2xl font-semibold">Sign in</h1>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-steel-300 px-3 py-2 text-black focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-steel-300 px-3 py-2 text-black focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          {error && (
            <p className="rounded-md border border-alert-300 bg-alert-50 px-3 py-2 text-sm font-medium text-black">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-brand-700 px-4 py-2 font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-black">
          New company?{" "}
          <Link href="/register" className="font-semibold text-brand-700 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
