"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ListTasksQueryInput, TaskPriority, TaskStatus } from "@repo/contract";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useTasksQuery,
  useUpdateTaskMutation,
} from "@lib/query/tasks-hooks";
import { useRouteAuthGuard } from "@lib/auth/use-route-auth-guard";
import { Task } from "@lib/api/types";
import {
  ResponsiveDialog,
  TaskDeleteAlert,
  TaskEmptyState,
  TaskFilters,
  TaskForm,
  TaskListSkeleton,
  TaskPagination,
  TaskRow,
} from "@components/tasks";

export default function TasksPage() {
  const { isLoading, isAuthenticated, canAccess } =
    useRouteAuthGuard("protected");

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [priority, setPriority] = useState<TaskPriority | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const params = useMemo<ListTasksQueryInput>(
    () => ({
      page,
      limit,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      priority: priority === "ALL" ? undefined : priority,
    }),
    [limit, page, priority, statusFilter],
  );

  const tasksQuery = useTasksQuery(params, isAuthenticated);
  const createTaskMutation = useCreateTaskMutation(params);
  const updateTaskMutation = useUpdateTaskMutation(params);
  const deleteTaskMutation = useDeleteTaskMutation(params);

  const totalPages = tasksQuery.data
    ? Math.max(1, Math.ceil(tasksQuery.data.meta.total / limit))
    : 1;
  const total = tasksQuery.data?.meta.total ?? 0;
  const hasFilters = statusFilter !== "ALL" || priority !== "ALL";

  const handleCreate = useCallback(
    async (data: {
      title: string;
      description?: string;
      priority: TaskPriority;
      status?: TaskStatus;
      dueDate?: string;
    }) => {
      await createTaskMutation.mutateAsync({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        status: "TODO",
      });
      setCreateOpen(false);
    },
    [createTaskMutation],
  );

  const handleEdit = useCallback(
    async (data: {
      title: string;
      description?: string;
      priority: TaskPriority;
      status?: TaskStatus;
      dueDate?: string;
    }) => {
      if (!editingTask) return;
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        payload: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          dueDate: data.dueDate,
        },
      });
      setEditingTask(null);
    },
    [editingTask, updateTaskMutation],
  );

  const handleStatusChange = useCallback(
    (id: string, newStatus: TaskStatus) => {
      updateTaskMutation.mutate({ id, payload: { status: newStatus } });
    },
    [updateTaskMutation],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingTask) return;
    deleteTaskMutation.mutate(deletingTask.id);
    setDeletingTask(null);
  }, [deletingTask, deleteTaskMutation]);

  const clearFilters = useCallback(() => {
    setStatusFilter("ALL");
    setPriority("ALL");
    setPage(1);
  }, []);

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

  if (!canAccess) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Tasks</h1>
          {total > 0 && (
            <Badge variant="secondary" className="text-[10px] tabular-nums">
              {total}
            </Badge>
          )}
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-3.5" />
          New task
        </Button>
      </div>

      {/* Filters */}
      <TaskFilters
        status={statusFilter}
        priority={priority}
        onStatusChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        onPriorityChange={(v) => {
          setPriority(v);
          setPage(1);
        }}
      />

      {/* Task list */}
      {tasksQuery.isLoading ? (
        <TaskListSkeleton />
      ) : tasksQuery.isError ? (
        <div className="error-banner">
          Unable to load tasks. Please try again.
        </div>
      ) : tasksQuery.data?.data.length === 0 ? (
        <TaskEmptyState
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          onCreateTask={() => setCreateOpen(true)}
        />
      ) : (
        <div className="space-y-2">
          {tasksQuery.data?.data.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onEdit={setEditingTask}
              onStatusChange={handleStatusChange}
              onDelete={setDeletingTask}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <TaskPagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      {/* Create dialog */}
      <ResponsiveDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create task"
        description="Add a new task to your list."
      >
        <TaskForm
          mode="create"
          isPending={createTaskMutation.isPending}
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </ResponsiveDialog>

      {/* Edit dialog */}
      <ResponsiveDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        title="Edit task"
        description="Update the task details."
      >
        {editingTask && (
          <TaskForm
            mode="edit"
            defaultValues={{
              title: editingTask.title,
              description: editingTask.description ?? undefined,
              priority: editingTask.priority,
              status: editingTask.status,
              dueDate: editingTask.dueDate ?? undefined,
            }}
            isPending={updateTaskMutation.isPending}
            onSubmit={handleEdit}
            onCancel={() => setEditingTask(null)}
          />
        )}
      </ResponsiveDialog>

      {/* Delete confirmation */}
      <TaskDeleteAlert
        open={!!deletingTask}
        taskTitle={deletingTask?.title ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
}
