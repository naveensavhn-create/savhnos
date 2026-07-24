"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPinned, Ruler, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { LogoMark } from "@/components/ui/logo-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: MapPinned,
    accent: "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300",
    title: "Geofenced site attendance",
    body: "Clock-ins are checked against each project's soft-geofenced site zone — no site, no attendance.",
  },
  {
    icon: Ruler,
    accent: "bg-warning-50 text-warning-700 dark:bg-warning/10 dark:text-warning",
    title: "Drawing approval workflow",
    body: "Versioned revisions, review sign-off and a full audit trail from architect to client.",
  },
  {
    icon: AlertTriangle,
    accent: "bg-danger-50 text-danger-700 dark:bg-danger/10 dark:text-danger",
    title: "Delays flagged instantly",
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
    <main className="min-h-screen bg-background">
      <div className="blueprint-bg border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-24 text-center">
          <div className="flex items-center gap-3">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight">savhnos</span>
          </div>
          <span className="rounded-full border border-primary-200 bg-primary-50 px-4 py-1 text-sm font-semibold text-primary-700 dark:border-primary-900 dark:bg-primary-900/30 dark:text-primary-300">
            Built for construction, architecture &amp; interior design teams
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            One platform for projects, HRMS, geofenced site attendance, drawings and accounting
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            savhnos brings your projects, field teams, approvals and finances together — with
            soft-geofenced clock-ins so attendance only counts when your team is actually on site.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="gap-1.5">
                Start free — create your company <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-5 px-6 py-16 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <CardContent className="p-6">
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${f.accent}`}>
                <f.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mb-1.5 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
