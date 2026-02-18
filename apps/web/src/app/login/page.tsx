"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/card";
import { Input } from "@ui/input";
import { useAuthStore } from "@lib/auth/auth-store";

export default function LoginPage() {
    const router = useRouter();
    const loginAction = useAuthStore((state) => state.loginAction);
    const authError = useAuthStore((state) => state.error);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        if (!email || !password) {
            setFormError("Please fill all required fields.");
            setIsSubmitting(false);
            return;
        }

        try {
            await loginAction({ email, password });
            router.replace("/tasks");
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "Unable to login");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="page-container flex min-h-screen items-center justify-center py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>Login to manage tasks across all your devices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={onSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input id="email" name="email" type="email" autoComplete="email" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        {(formError || authError) && (
                            <p className="text-sm text-destructive">{formError || authError}</p>
                        )}
                        <Button className="w-full" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        New here?{" "}
                        <Link href="/register" className="text-foreground underline underline-offset-4">
                            Create account
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
