"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/card";
import { Input } from "@ui/input";
import { useAuthStore } from "@lib/auth/auth-store";

export default function RegisterPage() {
    const router = useRouter();
    const registerAction = useAuthStore((state) => state.registerAction);
    const authError = useAuthStore((state) => state.error);
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

    return (
        <div className="page-container flex min-h-screen items-center justify-center py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Create your account</CardTitle>
                    <CardDescription>Start planning your work with secure session sync.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={onSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Full name
                            </label>
                            <Input id="name" name="name" type="text" autoComplete="name" required />
                        </div>
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
                            <Input id="password" name="password" type="password" required />
                        </div>
                        {(formError || authError) && (
                            <p className="text-sm text-destructive">{formError || authError}</p>
                        )}
                        <Button className="w-full" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating account..." : "Create account"}
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-foreground underline underline-offset-4">
                            Sign in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
