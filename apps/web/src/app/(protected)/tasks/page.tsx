"use client";

import { FormEvent, useMemo, useState } from "react";
import { ListTasksQueryInput, TaskPriority, TaskStatus } from "@repo/contract";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/card";
import { Input } from "@ui/input";
import { Select } from "@ui/select";
import { Textarea } from "@ui/textarea";
import {
    useCreateTaskMutation,
    useDeleteTaskMutation,
    useTasksQuery,
    useUpdateTaskMutation,
} from "@lib/query/tasks-hooks";

const priorityOptions = [
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
];

const statusOptions = [
    { label: "Todo", value: "TODO" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Done", value: "DONE" },
];

export default function TasksPage() {
    const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");
    const [priority, setPriority] = useState<TaskPriority | "ALL">("ALL");
    const [page, setPage] = useState(1);
    const limit = 10;

    const params = useMemo<ListTasksQueryInput>(
        () => ({
            page,
            limit,
            status: status === "ALL" ? undefined : status,
            priority: priority === "ALL" ? undefined : priority,
        }),
        [limit, page, priority, status],
    );

    const tasksQuery = useTasksQuery(params);
    const createTaskMutation = useCreateTaskMutation(params);
    const updateTaskMutation = useUpdateTaskMutation(params);
    const deleteTaskMutation = useDeleteTaskMutation(params);

    async function onCreateTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const title = String(formData.get("title") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();
        const dueDate = String(formData.get("dueDate") ?? "").trim();
        const taskPriority = String(formData.get("priority") ?? "MEDIUM") as TaskPriority;

        if (!title) {
            return;
        }

        await createTaskMutation.mutateAsync({
            title,
            description: description || undefined,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            priority: taskPriority,
            status: "TODO",
        });

        event.currentTarget.reset();
    }

    const totalPages = tasksQuery.data ? Math.max(1, Math.ceil(tasksQuery.data.meta.total / limit)) : 1;

    return (
        <div className="space-y-6">
            <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Task</CardTitle>
                        <CardDescription>
                            New tasks appear immediately via optimistic updates before server confirmation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={onCreateTask}>
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="title">
                                    Title
                                </label>
                                <Input id="title" name="title" maxLength={160} required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="description">
                                    Description
                                </label>
                                <Textarea id="description" name="description" maxLength={2000} />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium" htmlFor="priority">
                                        Priority
                                    </label>
                                    <Select id="priority" name="priority" options={priorityOptions} defaultValue="MEDIUM" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium" htmlFor="dueDate">
                                        Due date
                                    </label>
                                    <Input id="dueDate" name="dueDate" type="datetime-local" />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={createTaskMutation.isPending}>
                                {createTaskMutation.isPending ? "Creating..." : "Create task"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Tasks</CardTitle>
                            <CardDescription>Responsive board with optimistic create, update and delete.</CardDescription>
                        </div>
                        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-2">
                            <Select
                                options={[{ label: "All statuses", value: "ALL" }, ...statusOptions]}
                                value={status}
                                onChange={(event) => {
                                    setPage(1);
                                    setStatus(event.target.value as TaskStatus | "ALL");
                                }}
                            />
                            <Select
                                options={[{ label: "All priorities", value: "ALL" }, ...priorityOptions]}
                                value={priority}
                                onChange={(event) => {
                                    setPage(1);
                                    setPriority(event.target.value as TaskPriority | "ALL");
                                }}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {tasksQuery.isLoading ? (
                            <p className="text-sm text-muted-foreground">Loading tasks...</p>
                        ) : tasksQuery.isError ? (
                            <p className="text-sm text-destructive">Unable to load tasks.</p>
                        ) : tasksQuery.data?.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No tasks found for current filters.</p>
                        ) : (
                            <ul className="space-y-3">
                                {tasksQuery.data?.data.map((task) => {
                                    const optimistic = task.id.startsWith("optimistic-");

                                    return (
                                        <li key={task.id} className="surface p-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="space-y-2">
                                                    <p className="font-medium leading-snug">{task.title}</p>
                                                    {task.description ? (
                                                        <p className="text-sm text-muted-foreground">{task.description}</p>
                                                    ) : null}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge variant={task.priority === "HIGH" ? "destructive" : "secondary"}>
                                                            {task.priority}
                                                        </Badge>
                                                        <Badge variant={task.status === "DONE" ? "success" : "outline"}>
                                                            {task.status}
                                                        </Badge>
                                                        {optimistic ? <Badge variant="outline">Syncing...</Badge> : null}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            updateTaskMutation.mutate({
                                                                id: task.id,
                                                                payload: {
                                                                    status:
                                                                        task.status === "TODO"
                                                                            ? "IN_PROGRESS"
                                                                            : task.status === "IN_PROGRESS"
                                                                                ? "DONE"
                                                                                : "TODO",
                                                                },
                                                            })
                                                        }
                                                    >
                                                        Next status
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => deleteTaskMutation.mutate(task.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        <div className="flex flex-col items-start justify-between gap-3 border-t border-border pt-4 text-sm sm:flex-row sm:items-center">
                            <p className="text-muted-foreground">
                                Total: {tasksQuery.data?.meta.total ?? 0} · Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))}>
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
