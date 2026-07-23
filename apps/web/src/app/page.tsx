"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-6 text-center">
      <span className="rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200">
        Built for construction, architecture &amp; interior design teams
      </span>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        One platform for projects, HRMS, geofenced site attendance,
        drawings and accounting
      </h1>
      <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
        savhnos brings your projects, field teams, approvals and finances
        together — with soft-geofenced clock-ins so attendance only counts
        when your team is actually on site.
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow hover:bg-brand-700"
        >
          Start free — create your company
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 px-6 py-3 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
