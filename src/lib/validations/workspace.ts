import { z } from "zod";

export const WORKSPACE_VISIBILITY_VALUES = ["PRIVATE", "TEAM", "PUBLIC"] as const;

export const workspaceFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Workspace name is required")
    .max(100, "Workspace name cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  visibility: z.enum(WORKSPACE_VISIBILITY_VALUES, {
    error: "Visibility is required",
  }),
});

export type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;
