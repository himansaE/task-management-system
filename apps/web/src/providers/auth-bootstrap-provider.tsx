"use client";

import { useEffect } from "react";
import { useAuthStore } from "@lib/auth/auth-store";

export function AuthBootstrapProvider({ children }: { children: React.ReactNode }) {
    const bootstrap = useAuthStore((state) => state.bootstrap);
    const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

    useEffect(() => {
        if (!isBootstrapped) {
            void bootstrap();
        }
    }, [bootstrap, isBootstrapped]);

    return <>{children}</>;
}
