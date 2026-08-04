import { z } from "zod";

export const DEFAULT_COLUMN_COLOR = "#64748b";

const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

export const columnFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Column name is required")
    .max(200, "Column name cannot exceed 200 characters"),
  color: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || hexColorRegex.test(value),
      "Enter a valid hex color, for example #64748B.",
    )
    .optional(),
});

export type ColumnFormValues = z.infer<typeof columnFormSchema>;
