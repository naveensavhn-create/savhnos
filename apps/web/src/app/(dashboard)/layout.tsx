"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/employees", label: "Employees" },
  { href: "/attendance", label: "Attendance" },
  { href: "/clients", label: "Clients (CRM)" },
  { href: "/drawings", label: "Drawings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 px-2 text-xl font-bold text-brand-600">savhnos</div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                pathname === item.href
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
          <div className="font-medium">{user.email}</div>
          <div className="mb-3 text-slate-500">{user.role}</div>
          <button onClick={logout} className="text-brand-600 hover:underline">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
