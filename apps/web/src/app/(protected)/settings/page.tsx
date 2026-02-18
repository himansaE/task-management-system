"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui/alert-dialog";
import { Button } from "@ui/button";
import { Separator } from "@ui/separator";
import { Skeleton } from "@ui/skeleton";
import { useAuthStore } from "@lib/auth/auth-store";
import { useRouteAuthGuard } from "@lib/auth/use-route-auth-guard";
import { NetworkError } from "@components/network-error";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isLoading, canAccess, isError, error, retryAuth } =
    useRouteAuthGuard("protected");
  const user = useAuthStore((state) => state.user);
  const revokeAllAction = useAuthStore((state) => state.revokeAllAction);
  const [isRevoking, setIsRevoking] = useState(false);

  async function handleRevoke() {
    setIsRevoking(true);
    try {
      await revokeAllAction();
      router.replace("/login");
    } finally {
      setIsRevoking(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-4 w-28" />
          <Skeleton className="mx-auto h-3 w-16" />
        </div>
      </div>
    );
  }

  if (isError) {
    return <NetworkError message={error} onRetry={retryAuth} />;
  }

  if (!canAccess) {
    return null;
  }

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-lg font-semibold tracking-tight">Settings</h1>

      {/* Profile section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium">Profile</h2>
          <p className="text-xs text-muted-foreground">
            Your account information.
          </p>
        </div>
        <div className="surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <User className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name ?? "Authenticated User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email ?? "Email hidden"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Appearance section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium">Appearance</h2>
          <p className="text-xs text-muted-foreground">
            Choose your preferred color theme.
          </p>
        </div>
        <div
          className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5"
          role="radiogroup"
          aria-label="Theme selection"
        >
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={theme === value}
              onClick={() => setTheme(value)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                theme === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </section>

      <Separator />

      {/* Session controls */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium">Session controls</h2>
          <p className="text-xs text-muted-foreground">
            Manage your active sessions across devices.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isRevoking}>
              {isRevoking ? "Revoking..." : "Revoke all sessions"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke all sessions</AlertDialogTitle>
              <AlertDialogDescription>
                This will sign you out on all devices, including this one. You
                will need to sign in again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevoke}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Revoke all
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
