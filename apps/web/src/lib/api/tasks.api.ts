import {
  CreateTaskInput,
  ListTasksQueryInput,
  UpdateTaskInput,
} from "@repo/contract";
import { apiClient } from "./client";
import { ApiEnvelope, ApiPaginatedEnvelope, Task } from "./types";

export async function listTasks(query: ListTasksQueryInput) {
  const params = new URLSearchParams();

  params.set("page", String(query.page));
  params.set("limit", String(query.limit));

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.priority) {
    params.set("priority", query.priority);
  }

  const response = await apiClient.get<ApiPaginatedEnvelope<Task[]>>(
    `/tasks?${params.toString()}`,
  );
  return response.data;
}

export async function createTask(payload: CreateTaskInput) {
  const response = await apiClient.post<ApiEnvelope<Task>>("/tasks", payload);
  return response.data.data;
}

export async function updateTask(taskId: string, payload: UpdateTaskInput) {
  const response = await apiClient.put<ApiEnvelope<Task>>(
    `/tasks/${taskId}`,
    payload,
  );
  return response.data.data;
}

export async function deleteTask(taskId: string) {
  await apiClient.delete<ApiEnvelope<{ ok: boolean }>>(`/tasks/${taskId}`);
}
