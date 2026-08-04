import { z } from "zod";

export const boardFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Board name is required")
    .max(200, "Board name cannot exceed 200 characters"),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),
});

export type BoardFormValues = z.infer<typeof boardFormSchema>;
