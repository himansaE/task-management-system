"use client";

import { useRouter } from "next/navigation";
import { Button } from "@ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/card";
import { ModeToggle } from "@components/mode-toggle";
import { useAuthStore } from "@lib/auth/auth-store";

export default function SettingsPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const revokeAllAction = useAuthStore((state) => state.revokeAllAction);

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Account identity synced from auth session.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>
                        <span className="font-medium">Name:</span> {user?.name ?? "Authenticated User"}
                    </p>
                    <p>
                        <span className="font-medium">Email:</span> {user?.email ?? "Hidden in cookie-only session"}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>Switch appearance based on your workflow preference.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ModeToggle />
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Session Controls</CardTitle>
                    <CardDescription>Revoke all active sessions and force re-authentication.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="destructive"
                        onClick={async () => {
                            await revokeAllAction();
                            router.replace("/login");
                        }}
                    >
                        Revoke all sessions
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
