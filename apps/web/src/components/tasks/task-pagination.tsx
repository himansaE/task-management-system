"use client";

import { Button } from "@ui/button";

type TaskPaginationProps = {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
};

export function TaskPagination({ page, totalPages, total, onPageChange }: TaskPaginationProps) {
    if (total === 0) return null;

    return (
        <div className="flex flex-col items-start justify-between gap-3 border-t border-border pt-4 text-sm sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
                {total} task{total !== 1 ? "s" : ""} · Page {page} of {totalPages}
            </p>
            <div className="flex gap-1.5">
                <Button
                    variant="outline"
                    size="xs"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Previous page"
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="xs"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Next page"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
