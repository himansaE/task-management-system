"use client";

import { Calendar, Clock, Ellipsis, Pencil, Trash2 } from "lucide-react";
import { TaskPriority, TaskStatus } from "@repo/contract";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { Task } from "@lib/api/types";
import { relativeTime } from "@lib/utils/relative-time";

type TaskRowProps = {
    task: Task;
    onEdit: (task: Task) => void;
    onStatusChange: (id: string, status: TaskStatus) => void;
    onDelete: (task: Task) => void;
};

const statusLabels: Record<TaskStatus, string> = {
    TODO: "Todo",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
};

const statusStyles: Record<TaskStatus, string> = {
    TODO: "bg-secondary text-secondary-foreground",
    IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-transparent",
    DONE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-transparent",
};

const priorityStyles: Record<TaskPriority, string> = {
    LOW: "",
    MEDIUM: "",
    HIGH: "text-destructive",
};

export function TaskRow({ task, onEdit, onStatusChange, onDelete }: TaskRowProps) {
    const isOptimistic = task.id.startsWith("optimistic-");

    const dueInfo = task.dueDate ? relativeTime(task.dueDate) : null;

    return (
        <div className="surface-interactive group flex items-start gap-3 p-3 sm:p-4">
            {/* Status indicator dot */}
            <div className="mt-1.5 shrink-0">
                <div
                    className={`size-2.5 rounded-full ${task.status === "DONE"
                        ? "bg-emerald-500"
                        : task.status === "IN_PROGRESS"
                            ? "bg-blue-500"
                            : "bg-border"
                        }`}
                />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                    <p
                        className={`text-sm font-medium leading-snug ${task.status === "DONE" ? "line-through text-muted-foreground" : ""
                            }`}
                    >
                        {task.title}
                    </p>

                    {/* Actions dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 transition-opacity"
                                aria-label="Task actions"
                            >
                                <Ellipsis className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => onEdit(task)}>
                                <Pencil className="size-3.5" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Clock className="size-3.5" />
                                    Change status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {(Object.entries(statusLabels) as [TaskStatus, string][]).map(
                                        ([value, label]) => (
                                            <DropdownMenuItem
                                                key={value}
                                                disabled={task.status === value}
                                                onClick={() => onStatusChange(task.id, value)}
                                            >
                                                {label}
                                                {task.status === value && (
                                                    <span className="ml-auto text-xs text-muted-foreground">Current</span>
                                                )}
                                            </DropdownMenuItem>
                                        ),
                                    )}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onDelete(task)}
                            >
                                <Trash2 className="size-3.5" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {task.description && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                                {task.description}
                            </p>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start" className="max-w-xs">
                            <p className="text-xs">{task.description}</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                        variant={task.priority === "HIGH" ? "destructive" : "secondary"}
                        className={`text-[10px] px-1.5 py-0 ${priorityStyles[task.priority]}`}
                    >
                        {task.priority}
                    </Badge>
                    <Badge className={`text-[10px] px-1.5 py-0 ${statusStyles[task.status]}`}>
                        {statusLabels[task.status]}
                    </Badge>

                    {dueInfo && (
                        <span
                            className={`inline-flex items-center gap-1 text-[10px] ${dueInfo.overdue && task.status !== "DONE"
                                ? "text-destructive font-medium"
                                : "text-muted-foreground"
                                }`}
                        >
                            <Calendar className="size-2.5" />
                            {dueInfo.text}
                        </span>
                    )}

                    {isOptimistic && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 animate-pulse">
                            Syncing...
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}
