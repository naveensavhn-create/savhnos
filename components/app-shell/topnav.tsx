"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  Sparkles,
  Settings,
  LogOut,
  ChevronDown,
  FolderPlus,
  UserPlus,
  Handshake,
  Ruler,
  CircleCheckBig,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCommandPalette } from "@/components/command-palette-context";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { apiFetch } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Company {
  name: string;
  gstNumber: string | null;
}

export function TopNav() {
  const { user, logout } = useAuth();
  const { setOpen } = useCommandPalette();
  const { summary } = useDashboardSummary();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    apiFetch<Company>("/company/me").then(setCompany).catch(() => {});
  }, []);

  const pendingDrawings = summary?.approvals.pendingDrawingReviews ?? 0;
  const pendingLeave = summary?.workforce.pendingLeaveRequests ?? 0;
  const notificationCount = pendingDrawings + pendingLeave;

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-5">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="max-w-[160px] truncate">{company?.name ?? "Workspace"}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Workspace</DropdownMenuLabel>
          <DropdownMenuItem className="flex-col items-start gap-0.5">
            <span className="font-medium">{company?.name ?? "—"}</span>
            <span className="text-xs text-muted-foreground">{company?.gstNumber ?? "No GST on file"}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>+ Add company (multi-company switcher coming soon)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        onClick={() => setOpen(true)}
        className="ml-2 flex flex-1 max-w-md items-center gap-2 rounded-xl border border-border bg-muted/60 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:border-primary-300 hover:bg-card"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search everything…</span>
        <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Quick create</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => router.push("/projects?new=1")}>
              <FolderPlus className="h-4 w-4" /> New project
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/employees?new=1")}>
              <UserPlus className="h-4 w-4" /> New employee
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/clients?new=1")}>
              <Handshake className="h-4 w-4" /> New client
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/drawings?new=1")}>
              <Ruler className="h-4 w-4" /> New drawing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" disabled title="AI Assistant (coming soon)">
          <Sparkles className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-danger" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            {pendingDrawings > 0 && (
              <DropdownMenuItem onSelect={() => router.push("/approvals")} className="items-start gap-2.5">
                <CircleCheckBig className="mt-0.5 h-4 w-4 text-warning" />
                <span>
                  <span className="font-medium">{pendingDrawings} drawing revision{pendingDrawings === 1 ? "" : "s"}</span>{" "}
                  waiting for review
                </span>
              </DropdownMenuItem>
            )}
            {pendingLeave > 0 && (
              <DropdownMenuItem className="items-start gap-2.5" disabled>
                <Bell className="mt-0.5 h-4 w-4 text-warning" />
                <span>
                  <span className="font-medium">{pendingLeave} leave request{pendingLeave === 1 ? "" : "s"}</span>{" "}
                  pending (HRMS approvals coming soon)
                </span>
              </DropdownMenuItem>
            )}
            {notificationCount === 0 && (
              <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar name={user?.name ?? user?.email ?? "?"} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="font-medium text-foreground">{user?.name ?? user?.email}</span>
              <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              <Badge variant="primary" className="w-fit">
                {user?.role.replaceAll("_", " ")}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <Settings className="h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={logout}>
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
