"use client";

import { FormEvent, useRef } from "react";
import { TaskPriority, TaskStatus } from "@repo/contract";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Textarea } from "@ui/textarea";

type TaskFormData = {
  title: string;
  description?: string;
  priority: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
};

type TaskFormProps = {
  mode: "create" | "edit";
  defaultValues?: Partial<TaskFormData>;
  isPending?: boolean;
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
};

export function TaskForm({
  mode,
  defaultValues,
  isPending,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const priority = String(
      formData.get("priority") ?? "MEDIUM",
    ) as TaskPriority;
    const status = String(formData.get("status") ?? "TODO") as TaskStatus;
    const dueDate = String(formData.get("dueDate") ?? "").trim();

    if (!title) return;

    onSubmit({
      title,
      description: description || undefined,
      priority,
      status: mode === "edit" ? status : undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });

    if (mode === "create") {
      formRef.current?.reset();
    }
  }

  // Format ISO date to datetime-local value
  const defaultDueDate = defaultValues?.dueDate
    ? new Date(defaultValues.dueDate).toISOString().slice(0, 16)
    : undefined;

  return (
    <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          name="title"
          placeholder="What needs to be done?"
          maxLength={160}
          required
          defaultValue={defaultValues?.title}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-description">Description</Label>
        <Textarea
          id="task-description"
          name="description"
          placeholder="Add details..."
          maxLength={2000}
          rows={3}
          defaultValue={defaultValues?.description}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-priority">Priority</Label>
          <Select
            name="priority"
            defaultValue={defaultValues?.priority ?? "MEDIUM"}
          >
            <SelectTrigger id="task-priority" className="w-full">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-due-date">Due date</Label>
          <Input
            id="task-due-date"
            name="dueDate"
            type="datetime-local"
            defaultValue={defaultDueDate}
          />
        </div>
      </div>

      {mode === "edit" && (
        <div className="space-y-2">
          <Label htmlFor="task-status">Status</Label>
          <Select name="status" defaultValue={defaultValues?.status ?? "TODO"}>
            <SelectTrigger id="task-status" className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">Todo</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create task"
              : "Save changes"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
