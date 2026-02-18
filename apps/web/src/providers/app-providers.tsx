"use client";

import { ThemeProvider } from "@components/theme-provider";
import { AuthBootstrapProvider } from "./auth-bootstrap-provider";
import { QueryProvider } from "./query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <QueryProvider>
                <AuthBootstrapProvider>{children}</AuthBootstrapProvider>
            </QueryProvider>
        </ThemeProvider>
    );
}
