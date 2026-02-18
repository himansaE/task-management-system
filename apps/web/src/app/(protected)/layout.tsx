"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@ui/button";
import { ModeToggle } from "@components/mode-toggle";
import { useAuthStore } from "@lib/auth/auth-store";

const navigation = [
    { href: "/tasks", label: "Tasks" },
    { href: "/settings", label: "Settings" },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const logoutAction = useAuthStore((state) => state.logoutAction);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Close mobile menu on outside click
    useEffect(() => {
        if (!menuOpen) return;

        function handleClick(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setMenuOpen(false);
        }

        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [menuOpen]);

    const handleLogout = useCallback(async () => {
        await logoutAction();
        router.replace("/login");
    }, [logoutAction, router]);

    return (
        <div className="min-h-screen bg-background">
            <a href="#main-content" className="skip-link">
                Skip to content
            </a>

            <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
                <div className="page-container flex h-14 items-center justify-between">
                    <div className="flex items-center gap-6" ref={menuRef}>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="md:hidden"
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                        </Button>

                        <Link
                            href="/tasks"
                            className="text-sm font-semibold tracking-tight text-foreground"
                        >
                            TaskFlow Pro
                        </Link>

                        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${pathname === item.href
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile menu */}
                        {menuOpen && (
                            <>
                                <div className="fixed inset-0 top-14 z-30 bg-background/60 backdrop-blur-sm md:hidden" aria-hidden="true" />
                                <nav
                                    className="absolute left-0 top-14 z-40 w-full border-b border-border bg-background p-4 shadow-lg md:hidden"
                                    aria-label="Mobile navigation"
                                >
                                    <div className="page-container flex flex-col gap-1">
                                        {navigation.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${pathname === item.href
                                                    ? "bg-accent text-accent-foreground"
                                                    : "text-muted-foreground hover:text-foreground"
                                                    }`}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </nav>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <ModeToggle />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                            <LogOut className="size-3.5" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main id="main-content" className="page-container py-6 md:py-8">
                {children}
            </main>
        </div>
    );
}
