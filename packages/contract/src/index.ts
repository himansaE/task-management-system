import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(2).max(80),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
});

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional(),
  priority: taskPrioritySchema.default("MEDIUM"),
  dueDate: z.iso.datetime().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
