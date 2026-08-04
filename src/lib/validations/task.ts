import { z } from "zod";

export const TASK_PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(500, "Task title cannot exceed 500 characters"),
  details: z
    .string()
    .max(10000, "Task details cannot exceed 10000 characters"),
  columnId: z.string().min(1, "Column is required"),
  priority: z.enum(TASK_PRIORITY_VALUES, {
    error: "Priority is required",
  }),
  dueDate: z.string(),
  assigneeIds: z.array(z.string()),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
