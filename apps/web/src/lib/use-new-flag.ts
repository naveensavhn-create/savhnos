"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Reads ?new=1 from the URL on mount (via window.location, not useSearchParams,
 * so pages using this don't need a Suspense boundary) and strips it afterward.
 */
export function useNewFlag() {
  const [isNew, setIsNew] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      setIsNew(true);
      router.replace(window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isNew;
}
