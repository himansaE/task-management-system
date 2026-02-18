"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./auth-store";

type RouteAuthMode = "protected" | "guest";

export function useRouteAuthGuard(mode: RouteAuthMode) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  const isLoading =
    !isBootstrapped || status === "refreshing" || status === "unknown";
  const isAuthenticated = isBootstrapped && status === "authenticated";

  useEffect(() => {
    if (!isBootstrapped) return;

    if (mode === "protected" && status === "unauthenticated") {
      router.replace("/login");
    }

    if (mode === "guest" && status === "authenticated") {
      router.replace("/tasks");
    }
  }, [isBootstrapped, mode, router, status]);

  const canAccess =
    !isLoading &&
    ((mode === "protected" && status === "authenticated") ||
      (mode === "guest" && status === "unauthenticated"));

  return {
    isLoading,
    isAuthenticated,
    canAccess,
  };
}
