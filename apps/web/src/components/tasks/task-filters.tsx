"use client";

import { TaskPriority, TaskStatus } from "@repo/contract";
import { Button } from "@ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";

type TaskFiltersProps = {
    status: TaskStatus | "ALL";
    priority: TaskPriority | "ALL";
    onStatusChange: (value: TaskStatus | "ALL") => void;
    onPriorityChange: (value: TaskPriority | "ALL") => void;
};

const statusFilters: { value: TaskStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "TODO", label: "Todo" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DONE", label: "Done" },
];

export function TaskFilters({ status, priority, onStatusChange, onPriorityChange }: TaskFiltersProps) {
    const hasActiveFilters = status !== "ALL" || priority !== "ALL";

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Status segmented pills */}
            <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5" role="group" aria-label="Filter by status">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => onStatusChange(filter.value)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${status === filter.value
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        aria-pressed={status === filter.value}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Priority dropdown */}
            <Select value={priority} onValueChange={(v) => onPriorityChange(v as TaskPriority | "ALL")}>
                <SelectTrigger className="h-8 w-[130px] text-xs" size="sm" aria-label="Filter by priority">
                    <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All priorities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="xs"
                    className="text-muted-foreground"
                    onClick={() => {
                        onStatusChange("ALL");
                        onPriorityChange("ALL");
                    }}
                >
                    Clear filters
                </Button>
            )}
        </div>
    );
}
