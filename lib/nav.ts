import {
  LayoutDashboard,
  FolderKanban,
  Users,
  MapPinned,
  Handshake,
  Wallet,
  UserSquare2,
  ShoppingCart,
  Boxes,
  Ruler,
  CircleCheckBig,
  FileText,
  BarChart3,
  Sparkles,
  Settings,
  FileSignature,
  ShieldAlert,
  ClipboardX,
  ClipboardList,
  Calculator,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  /** True when a real backend endpoint powers this page today. */
  live: boolean;
  badgeKey?: "pendingDrawingReviews" | "pendingLeaveRequests";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "G D", live: true }],
  },
  {
    label: "Delivery",
    items: [
      { href: "/projects", label: "Projects", icon: FolderKanban, shortcut: "G P", live: true },
      { href: "/attendance", label: "Attendance", icon: MapPinned, shortcut: "G A", live: true },
      { href: "/drawings", label: "Drawings", icon: Ruler, shortcut: "G W", live: true },
      {
        href: "/approvals",
        label: "Approvals",
        icon: CircleCheckBig,
        shortcut: "G R",
        live: true,
        badgeKey: "pendingDrawingReviews",
      },
      { href: "/documents", label: "Documents", icon: FileText, live: false },
    ],
  },
  {
    label: "Commercial",
    items: [
      { href: "/cost-control", label: "Cost Control", icon: Calculator, live: true },
      { href: "/variations", label: "Variations", icon: FileSignature, live: true },
      { href: "/finance", label: "Finance", icon: Wallet, live: false },
    ],
  },
  {
    label: "Quality & Safety",
    items: [
      { href: "/safety", label: "Safety (EHS)", icon: ShieldAlert, live: true },
      { href: "/quality", label: "Quality (NCR)", icon: ClipboardX, live: true },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/employees", label: "Employees", icon: Users, shortcut: "G E", live: true },
      { href: "/clients", label: "Clients & CRM", icon: Handshake, shortcut: "G C", live: true },
      { href: "/hrms", label: "HRMS", icon: UserSquare2, live: false },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/estimation", label: "Estimation & Tendering", icon: ClipboardList, live: false },
      { href: "/procurement", label: "Procurement", icon: ShoppingCart, live: false },
      { href: "/inventory", label: "Inventory", icon: Boxes, live: false },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3, live: false },
      { href: "/ai-assistant", label: "AI Assistant", icon: Sparkles, live: false },
    ],
  },
  {
    label: "Workspace",
    items: [{ href: "/settings", label: "Settings", icon: Settings, shortcut: "G S", live: true }],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
