"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@ui/button";
import { cn } from "@lib/utils";

interface NetworkErrorProps {
  message?: string | null;
  onRetry: () => void | Promise<void>;
  /** "full" = min-h-screen (guest pages), "partial" = min-h-[50vh] (protected pages) */
  fill?: "full" | "partial";
}

export function NetworkError({
  message,
  onRetry,
  fill = "partial",
}: NetworkErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  async function handleRetry() {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center px-4",
        fill === "full" ? "min-h-screen" : "min-h-[50vh]",
      )}
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-6 text-center">
        {/* Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-destructive/10 blur-xl" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
            <WifiOff className="h-7 w-7 text-destructive" strokeWidth={1.5} />
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold tracking-tight">
            Connection problem
          </h2>
          <p className="text-sm text-muted-foreground">
            {message && message.length < 120
              ? message
              : "We couldn't reach the server. Check your connection and try again."}
          </p>
        </div>

        {/* Retry button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => void handleRetry()}
          disabled={isRetrying}
          className="gap-2"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isRetrying && "animate-spin")}
          />
          {isRetrying ? "Retrying…" : "Try again"}
        </Button>
      </div>
    </div>
  );
}
