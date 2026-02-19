"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@ui/button";
import { cn } from "@lib/utils";

interface NetworkErrorProps {
  message?: string | null;
  onRetry: () => unknown;
  /** "full" = min-h-screen (guest pages), "partial" = min-h-[50vh] (protected pages), "inline" = compact card in content area */
  fill?: "full" | "partial" | "inline";
  /** Override the heading text */
  title?: string;
}

export function NetworkError({
  message,
  onRetry,
  fill = "partial",
  title,
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

  if (fill === "inline") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
        {/* Icon */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
          <WifiOff className="h-5 w-5 text-destructive" strokeWidth={1.5} />
        </div>

        {/* Copy */}
        <div className="space-y-1">
          <p className="text-sm font-medium">{title ?? "Unable to load"}</p>
          <p className="text-xs text-muted-foreground">
            {message && message.length < 120
              ? message
              : "Something went wrong. Check your connection and try again."}
          </p>
        </div>

        {/* Retry */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => void handleRetry()}
          disabled={isRetrying}
          className="h-7 gap-1.5 px-3 text-xs"
        >
          <RefreshCw className={cn("h-3 w-3", isRetrying && "animate-spin")} />
          {isRetrying ? "Retrying…" : "Try again"}
        </Button>
      </div>
    );
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
            {title ?? "Connection problem"}
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
