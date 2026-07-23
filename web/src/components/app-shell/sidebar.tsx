"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsLeft, ChevronsRight, Star, Clock, Wifi, WifiOff, Construction } from "lucide-react";
import { NAV_GROUPS, ALL_NAV_ITEMS } from "@/lib/nav";
import { useNavHistory } from "@/lib/use-nav-history";
import { useDashboardSummary } from "@/lib/use-dashboard-summary";
import { LogoMark } from "@/components/ui/logo-mark";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";

const COLLAPSE_KEY = "savhnos_sidebar_collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const { recents, pinned, togglePinned } = useNavHistory();
  const { summary } = useDashboardSummary();
  const [collapsed, setCollapsed] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  useEffect(() => {
    apiFetch("/dashboard/summary")
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      window.localStorage.setItem(COLLAPSE_KEY, prev ? "0" : "1");
      return !prev;
    });
  };

  const badgeValue = (key?: "pendingDrawingReviews" | "pendingLeaveRequests") => {
    if (!key || !summary) return undefined;
    if (key === "pendingDrawingReviews") return summary.approvals.pendingDrawingReviews;
    if (key === "pendingLeaveRequests") return summary.workforce.pendingLeaveRequests;
    return undefined;
  };

  const pinnedItems = ALL_NAV_ITEMS.filter((i) => pinned.includes(i.href));
  const recentItems = ALL_NAV_ITEMS.filter((i) => recents.includes(i.href) && i.href !== pathname).slice(0, 4);

  return (
    <TooltipProvider delayDuration={200}>
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative flex h-screen shrink-0 flex-col border-r border-border bg-card"
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-4">
          <LogoMark size={32} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-base font-bold tracking-tight"
              >
                savhnos
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {!collapsed && pinnedItems.length > 0 && (
            <SidebarGroup label="Favorites">
              {pinnedItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  collapsed={collapsed}
                  badge={badgeValue(item.badgeKey)}
                  pinned
                  onPinToggle={togglePinned}
                />
              ))}
            </SidebarGroup>
          )}

          {!collapsed && recentItems.length > 0 && (
            <SidebarGroup label="Recent" icon={Clock}>
              {recentItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  collapsed={collapsed}
                  badge={badgeValue(item.badgeKey)}
                  pinned={pinned.includes(item.href)}
                  onPinToggle={togglePinned}
                  compact
                />
              ))}
            </SidebarGroup>
          )}

          {NAV_GROUPS.map((group) => (
            <SidebarGroup key={group.label} label={collapsed ? undefined : group.label}>
              {group.items.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  collapsed={collapsed}
                  badge={badgeValue(item.badgeKey)}
                  pinned={pinned.includes(item.href)}
                  onPinToggle={togglePinned}
                />
              ))}
            </SidebarGroup>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={toggle}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && "Collapse"}
          </button>
          {!collapsed && (
            <div className="space-y-1.5 rounded-xl bg-muted/60 px-3 py-2.5 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <Construction className="h-3.5 w-3.5" />
                Beta workspace
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>v0.2.0</span>
                <span className="inline-flex items-center gap-1">
                  {online === false ? (
                    <>
                      <WifiOff className="h-3 w-3 text-danger" /> Offline
                    </>
                  ) : (
                    <>
                      <Wifi className="h-3 w-3 text-success" /> Online
                    </>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}

function SidebarGroup({
  label,
  icon: Icon,
  children,
}: {
  label?: string;
  icon?: typeof Clock;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center gap-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {Icon && <Icon className="h-3 w-3" />}
          {label}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  collapsed,
  badge,
  pinned,
  onPinToggle,
  compact,
}: {
  item: (typeof ALL_NAV_ITEMS)[number];
  active: boolean;
  collapsed: boolean;
  badge?: number;
  pinned: boolean;
  onPinToggle: (href: string) => void;
  compact?: boolean;
}) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-xl px-2.5 text-sm font-medium transition-colors",
        compact ? "py-1.5" : "py-2",
        active ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300" : "text-foreground/80 hover:bg-accent hover:text-foreground"
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary"
          transition={{ duration: 0.2 }}
        />
      )}
      <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} strokeWidth={2} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {!item.live && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
              Soon
            </span>
          )}
          {badge !== undefined && badge > 0 && (
            <Badge variant={active ? "solid" : "primary"} className="px-1.5 py-0 text-[10px]">
              {badge}
            </Badge>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              onPinToggle(item.href);
            }}
            className={cn(
              "shrink-0 rounded-md p-0.5 opacity-0 transition-opacity hover:bg-background group-hover:opacity-100",
              pinned && "opacity-100 text-warning"
            )}
          >
            <Star className="h-3 w-3" fill={pinned ? "currentColor" : "none"} />
          </button>
        </>
      )}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">
        {item.label}
        {item.shortcut && <span className="ml-2 opacity-60">{item.shortcut}</span>}
      </TooltipContent>
    </Tooltip>
  );
}
