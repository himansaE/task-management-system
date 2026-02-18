"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ModeToggle } from "@components/mode-toggle";
import { Button } from "@ui/button";
import { useAuthStore } from "@lib/auth/auth-store";

const navigation = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tasks", label: "Tasks" },
    { href: "/settings", label: "Settings" },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const status = useAuthStore((state) => state.status);
    const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
    const logoutAction = useAuthStore((state) => state.logoutAction);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (isBootstrapped && status === "unauthenticated") {
            router.replace("/login");
        }
    }, [isBootstrapped, status, router]);

    if (!isBootstrapped || status === "refreshing" || status === "unknown") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-muted-foreground">Bootstrapping secure session...</p>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
                <div className="page-container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden rounded-md border border-border px-3 py-2 text-sm"
                            onClick={() => setMenuOpen((value) => !value)}
                            aria-label="Toggle navigation"
                        >
                            Menu
                        </button>
                        <Link href="/tasks" className="text-base font-semibold tracking-tight">
                            TaskFlow Pro
                        </Link>
                        <nav className="hidden items-center gap-2 md:flex">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-md px-3 py-2 text-sm transition-colors ${pathname === item.href
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                await logoutAction();
                                router.replace("/login");
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {menuOpen && (
                    <div className="md:hidden border-t border-border">
                        <nav className="page-container py-3 flex flex-col gap-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-md px-3 py-2 text-sm ${pathname === item.href
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                                        }`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            <main className="page-container py-6 md:py-8">{children}</main>
        </div>
    );
}
