"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-accounts";
import { LogoMark } from "@/components/ui/logo-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
      setPendingRole(null);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  const onDemoClick = (demoEmail: string, role: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setPendingRole(role);
    doLogin(demoEmail, DEMO_PASSWORD);
  };

  return (
    <main className="blueprint-bg flex min-h-screen items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-3xl flex-col gap-5 lg:flex-row lg:items-stretch">
        <Card className="w-full lg:max-w-sm">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <LogoMark size={32} />
              <h1 className="text-2xl font-semibold">Sign in</h1>
            </div>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Password</label>
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && (
                <p className="rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700 dark:border-danger/20 dark:bg-danger/10 dark:text-danger">
                  {error}
                </p>
              )}
              <Button type="submit" loading={submitting && !pendingRole} size="lg">
                Sign in
              </Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
              New company?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="w-full lg:max-w-sm">
          <CardContent className="p-8">
            <div className="mb-1 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Try a demo account</h2>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Pre-seeded workspace with live projects, attendance, drawings and finances. Pick a
              role to sign in instantly — every account uses the password{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono">{DEMO_PASSWORD}</code>.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => onDemoClick(account.email, account.role)}
                  disabled={submitting}
                  className="rounded-lg border border-border bg-card px-2.5 py-2 text-left text-xs font-medium transition-colors hover:border-primary-300 hover:bg-primary-50 disabled:opacity-50 dark:hover:bg-primary-900/20"
                >
                  <span className="flex items-center justify-between gap-1">
                    {account.label}
                    {submitting && pendingRole === account.role && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="block truncate text-[10px] font-normal text-muted-foreground">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
