"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ALL_NAV_ITEMS } from "@/lib/nav";

const RECENTS_KEY = "savhnos_recent_paths";
const PINNED_KEY = "savhnos_pinned_paths";
const MAX_RECENTS = 5;

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

export function useNavHistory() {
  const pathname = usePathname();
  const [recents, setRecents] = useState<string[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);

  useEffect(() => {
    setRecents(readList(RECENTS_KEY));
    setPinned(readList(PINNED_KEY));
  }, []);

  useEffect(() => {
    if (!pathname || !ALL_NAV_ITEMS.some((i) => i.href === pathname)) return;
    setRecents((prev) => {
      const next = [pathname, ...prev.filter((p) => p !== pathname)].slice(0, MAX_RECENTS);
      window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      return next;
    });
  }, [pathname]);

  const togglePinned = useCallback((href: string) => {
    setPinned((prev) => {
      const next = prev.includes(href) ? prev.filter((p) => p !== href) : [...prev, href];
      window.localStorage.setItem(PINNED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recents, pinned, togglePinned };
}
