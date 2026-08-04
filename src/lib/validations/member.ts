import { z } from "zod";

export const MEMBER_INVITE_ROLE_VALUES = ["ADMIN", "MEMBER"] as const;

export const memberInviteFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
  role: z.enum(MEMBER_INVITE_ROLE_VALUES, {
    error: "Role is required",
  }),
});

export type MemberInviteFormValues = z.infer<typeof memberInviteFormSchema>;
