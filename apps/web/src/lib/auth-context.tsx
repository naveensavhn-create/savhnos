"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { JwtPayload } from "@savhnos/shared";
import { apiFetch, clearToken, setToken } from "./api";

interface AuthResponse {
  accessToken: string;
  user: JwtPayload;
}

interface AuthContextValue {
  user: JwtPayload | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerCompany: (input: {
    companyName: string;
    ownerName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("savhnos_token");
    if (token) {
      setUser(decodeJwt(token));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(res.accessToken);
    setUser(res.user);
    router.push("/dashboard");
  };

  const registerCompany: AuthContextValue["registerCompany"] = async (input) => {
    const res = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setToken(res.accessToken);
    setUser(res.user);
    router.push("/dashboard");
  };

  const logout = () => {
    clearToken();
    setUser(null);
    router.push("/login");
  };

  const value = useMemo(
    () => ({ user, loading, login, registerCompany, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
