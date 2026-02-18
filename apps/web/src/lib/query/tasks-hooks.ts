"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateTaskInput,
  ListTasksQueryInput,
  UpdateTaskInput,
} from "@repo/contract";
import { toast } from "sonner";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "@lib/api/tasks.api";
import { ApiPaginatedEnvelope, Task } from "@lib/api/types";
import { normalizeApiError } from "@lib/api/errors";
import { queryKeys } from "./keys";

type TasksPageData = ApiPaginatedEnvelope<Task[]>;

export function useTasksQuery(params: ListTasksQueryInput, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tasks(params),
    queryFn: () => listTasks(params),
    enabled,
  });
}

export function useCreateTaskMutation(params: ListTasksQueryInput) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskInput) => createTask(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks(params) });

      const previous = queryClient.getQueryData<TasksPageData>(
        queryKeys.tasks(params),
      );

      if (previous) {
        const optimisticTask: Task = {
          id: `optimistic-${Date.now()}`,
          ownerId: "me",
          title: payload.title,
          description: payload.description ?? null,
          priority: payload.priority,
          status: payload.status,
          dueDate: payload.dueDate ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<TasksPageData>(queryKeys.tasks(params), {
          ...previous,
          data: [optimisticTask, ...previous.data],
          meta: {
            ...previous.meta,
            total: previous.meta.total + 1,
          },
        });
      }

      return { previous };
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks(params), context.previous);
      }
      toast.error(normalizeApiError(error).message);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tasks(params),
      });
    },
    onSuccess: () => {
      toast.success("Task created");
    },
  });
}

export function useUpdateTaskMutation(params: ListTasksQueryInput) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskInput }) =>
      updateTask(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks(params) });
      const previous = queryClient.getQueryData<TasksPageData>(
        queryKeys.tasks(params),
      );

      if (previous) {
        queryClient.setQueryData<TasksPageData>(queryKeys.tasks(params), {
          ...previous,
          data: previous.data.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...payload,
                  description:
                    payload.description === undefined
                      ? task.description
                      : (payload.description ?? null),
                  updatedAt: new Date().toISOString(),
                }
              : task,
          ),
        });
      }

      return { previous };
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks(params), context.previous);
      }
      toast.error(normalizeApiError(error).message);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tasks(params),
      });
    },
    onSuccess: () => {
      toast.success("Task updated");
    },
  });
}

export function useDeleteTaskMutation(params: ListTasksQueryInput) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks(params) });
      const previous = queryClient.getQueryData<TasksPageData>(
        queryKeys.tasks(params),
      );

      if (previous) {
        queryClient.setQueryData<TasksPageData>(queryKeys.tasks(params), {
          ...previous,
          data: previous.data.filter((task) => task.id !== id),
          meta: {
            ...previous.meta,
            total: Math.max(0, previous.meta.total - 1),
          },
        });
      }

      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks(params), context.previous);
      }
      toast.error(normalizeApiError(error).message);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tasks(params),
      });
    },
    onSuccess: () => {
      toast.success("Task deleted");
    },
  });
}
