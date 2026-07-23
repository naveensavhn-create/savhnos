"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LogoMark } from "@/components/ui/logo-mark";

const FEATURES = [
  {
    dotClass: "bg-brand-600",
    title: "Geofenced site attendance",
    body: "Clock-ins are checked against each project's soft-geofenced site zone — no site, no attendance.",
  },
  {
    dotClass: "bg-safety-500",
    title: "Drawing approval workflow",
    body: "Versioned revisions, review sign-off and a full audit trail from architect to client.",
  },
  {
    dotClass: "bg-alert-600",
    title: "Delays flagged in red",
    body: "Project status, drawing reviews and pipeline stages are color-coded so risk is visible at a glance.",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  return (
    <main className="min-h-screen">
      <div className="blueprint-bg border-b border-steel-200">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-24 text-center">
          <div className="flex items-center gap-3">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight">savhnos</span>
          </div>
          <span className="rounded-full border border-brand-300 bg-brand-50 px-4 py-1 text-sm font-semibold text-black">
            Built for construction, architecture &amp; interior design teams
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            One platform for projects, HRMS, geofenced site attendance,
            drawings and accounting
          </h1>
          <p className="max-w-2xl text-lg text-black">
            savhnos brings your projects, field teams, approvals and finances
            together — with soft-geofenced clock-ins so attendance only counts
            when your team is actually on site.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-safety-500 px-6 py-3 font-semibold text-black shadow hover:bg-safety-600"
            >
              Start free — create your company
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-steel-300 bg-white px-6 py-3 font-semibold text-black hover:bg-steel-100"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-steel-200 bg-white p-6 shadow-sm"
          >
            <div className={`mb-3 h-2 w-10 rounded-full ${f.dotClass}`} />
            <h3 className="mb-2 font-semibold">{f.title}</h3>
            <p className="text-sm text-black">{f.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
