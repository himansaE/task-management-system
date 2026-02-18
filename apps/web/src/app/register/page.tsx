"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/card";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Skeleton } from "@ui/skeleton";
import { useAuthStore } from "@lib/auth/auth-store";
import { useRouteAuthGuard } from "@lib/auth/use-route-auth-guard";

export default function RegisterPage() {
    const router = useRouter();
    const { isLoading, canAccess } = useRouteAuthGuard("guest");
    const registerAction = useAuthStore((state) => state.registerAction);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const name = String(formData.get("name") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        if (!name || !email || !password) {
            setFormError("Please fill all required fields.");
            setIsSubmitting(false);
            return;
        }

        try {
            await registerAction({ name, email, password });
            router.replace("/tasks");
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "Unable to register");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="space-y-2 text-center">
                    <Skeleton className="mx-auto h-4 w-28" />
                    <Skeleton className="mx-auto h-3 w-16" />
                </div>
            </div>
        );
    }

    if (!canAccess) {
        return null;
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
            {/* Subtle background pattern */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,var(--accent)_0%,transparent_50%)] opacity-40" />

            <div className="relative w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-lg font-semibold tracking-tight">TaskFlow Pro</h1>
                    <p className="mt-1 text-xs text-muted-foreground">Secure task management</p>
                </div>

                <Card>
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl">Create your account</CardTitle>
                        <CardDescription>Get started with secure task management.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={onSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full name</Label>
                                <Input id="name" name="name" type="text" autoComplete="name" placeholder="Jane Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                                <p className="text-[10px] text-muted-foreground">8–72 characters</p>
                            </div>
                            {formError && (
                                <div className="error-banner">{formError}</div>
                            )}
                            <Button className="w-full" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating account..." : "Create account"}
                            </Button>
                        </form>
                        <p className="mt-4 text-center text-xs text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
