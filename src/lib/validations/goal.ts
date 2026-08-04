import { z } from "zod";

export const GOAL_STATUS_VALUES = [
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
] as const;

export const GOAL_PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

function hasRichTextContent(value: string) {
  return (
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim().length > 0
  );
}

export const goalFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Goal title is required")
      .max(500, "Goal title cannot exceed 500 characters"),
    details: z
      .string()
      .max(10000, "Goal details cannot exceed 10000 characters")
      .refine(hasRichTextContent, "Goal details are required"),
    status: z.enum(GOAL_STATUS_VALUES, {
      error: "Status is required",
    }),
    priority: z.enum(GOAL_PRIORITY_VALUES, {
      error: "Priority is required",
    }),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date"),
    dueDate: z
      .string()
      .min(1, "Due date is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid due date"),
  })
  .superRefine((data, ctx) => {
    if (new Date(`${data.dueDate}T00:00:00`) < new Date(`${data.startDate}T00:00:00`)) {
      ctx.addIssue({
        code: "custom",
        message: "Due date cannot be earlier than start date",
        path: ["dueDate"],
      });
    }
  });

export type GoalFormValues = z.infer<typeof goalFormSchema>;
