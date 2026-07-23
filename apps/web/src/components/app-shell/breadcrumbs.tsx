"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { ALL_NAV_ITEMS } from "@/lib/nav";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const navItem = ALL_NAV_ITEMS.find((i) => i.href === `/${segments[0]}`);
  const crumbs = [{ label: navItem?.label ?? segments[0], href: `/${segments[0]}` }];
  if (segments.length > 1) {
    crumbs.push({ label: "Detail", href: pathname });
  }

  return (
    <div className="flex items-center gap-1.5 border-b border-border px-6 py-2.5 text-sm text-muted-foreground lg:px-8">
      <Link href="/dashboard" className="flex items-center hover:text-foreground">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((c, i) => (
        <span key={c.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5" />
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-foreground">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
