"use client";

import { useMemo } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import type { UserRole } from "@/lib/enums";

export interface AuthUser {
  sub: string;
  email: string;
  name: string | null;
  role: UserRole;
  companyId: string;
}

/**
 * API-compatible replacement for the old localStorage/JWT auth-context hook,
 * backed by Auth.js sessions instead of a bearer token.
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const res = await signIn("credentials", { email, password, redirect: false });
    if (!res || res.error) {
      throw new ApiError(401, "Invalid email or password");
    }
    router.push("/dashboard");
    router.refresh();
  };

  const registerCompany = async (input: {
    companyName: string;
    ownerName: string;
    email: string;
    password: string;
  }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.message ?? "Registration failed");
    }
    await login(input.email, input.password);
  };

  const logout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const user: AuthUser | null = useMemo(() => {
    if (!session?.user) return null;
    return {
      sub: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name ?? null,
      role: session.user.role,
      companyId: session.user.companyId,
    };
  }, [session]);

  return {
    user,
    loading: status === "loading",
    login,
    registerCompany,
    logout,
  };
}
