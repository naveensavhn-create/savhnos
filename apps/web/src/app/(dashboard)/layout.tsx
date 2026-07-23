"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/app-shell/shell";
import { LogoMark } from "@/components/ui/logo-mark";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <LogoMark size={40} className="animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading savhnos…</p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
