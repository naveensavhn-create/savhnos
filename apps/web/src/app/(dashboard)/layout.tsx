"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { LogoMark } from "@/components/ui/logo-mark";

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
    return <div className="flex min-h-screen items-center justify-center text-black">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen bg-steel-50">
      <aside className="flex w-64 flex-col border-r border-steel-200 bg-white p-4">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <LogoMark size={30} />
          <span className="text-lg font-bold tracking-tight text-black">savhnos</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md border-l-4 px-3 py-2 text-sm font-semibold ${
                pathname === item.href
                  ? "border-brand-700 bg-brand-50 text-black"
                  : "border-transparent text-black hover:bg-steel-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-steel-200 pt-4 text-sm">
          <div className="font-semibold text-black">{user.email}</div>
          <div className="mb-3 inline-flex rounded-full bg-steel-100 px-2 py-0.5 text-xs font-semibold text-black">
            {user.role.replaceAll("_", " ")}
          </div>
          <button
            onClick={logout}
            className="block font-semibold text-alert-700 hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
