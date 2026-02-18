"use client";

import { ClipboardList } from "lucide-react";
import { Button } from "@ui/button";

type TaskEmptyStateProps = {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateTask: () => void;
};

export function TaskEmptyState({
  hasFilters,
  onClearFilters,
  onCreateTask,
}: TaskEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <ClipboardList className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">
        {hasFilters ? "No tasks match your filters" : "No tasks yet"}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-[220px]">
        {hasFilters
          ? "Try adjusting your filters to see more tasks."
          : "Create your first task to get started with TaskFlow Pro."}
      </p>
      <div className="mt-4">
        {hasFilters ? (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        ) : (
          <Button size="sm" onClick={onCreateTask}>
            Create your first task
          </Button>
        )}
      </div>
    </div>
  );
}
