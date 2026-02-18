"use client";

import { ThemeProvider } from "@components/theme-provider";
import { Toaster } from "@ui/sonner";
import { TooltipProvider } from "@ui/tooltip";
import { AuthBootstrapProvider } from "./auth-bootstrap-provider";
import { QueryProvider } from "./query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <QueryProvider>
                <TooltipProvider delayDuration={300}>
                    <AuthBootstrapProvider>{children}</AuthBootstrapProvider>
                </TooltipProvider>
                <Toaster richColors closeButton position="bottom-right" />
            </QueryProvider>
        </ThemeProvider>
    );
}
