import { z } from "zod";

export const meetingFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(500, "Title cannot exceed 500 characters"),
  startDate: z.date({
    error: "Date and time are required",
  }),
  startTime: z
    .string()
    .min(1, "Date and time are required")
    .regex(/^\d{2}:\d{2}$/, "Invalid time"),
  location: z
    .string()
    .max(500, "Location cannot exceed 500 characters")
    .optional(),
  message: z
    .string()
    .max(10000, "Message cannot exceed 10000 characters")
    .optional(),
});

export type MeetingFormValues = z.infer<typeof meetingFormSchema>;
