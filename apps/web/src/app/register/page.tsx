"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { registerCompany } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerCompany({ companyName, ownerName, email, password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-6 text-2xl font-semibold">Create your company</h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Company name</label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Your name</label>
            <input
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create company"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-600">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
