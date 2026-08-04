"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarDays, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AppModalHeader } from "@/components/app/app-modal-header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api/get-error-message";
import {
  meetingFormSchema,
  type MeetingFormValues,
} from "@/lib/validations/meeting";
import { cn } from "@/lib/utils";
import type { CalendarEventDoc } from "@/types/domain";

type MeetingInput = {
  title: string;
  message?: string;
  startsAt: string;
  location?: string;
};

const toDateTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(date);
  value.setHours(hours, minutes, 0, 0);
  return value;
};

export function CreateMeetingDialog({
  open,
  defaultDate,
  isPending,
  onOpenChange,
  onCreate,
  meeting,
  onUpdate,
}: {
  open: boolean;
  defaultDate: Date;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (meeting: MeetingInput) => Promise<void>;
  meeting?: CalendarEventDoc | null;
  onUpdate?: (meeting: MeetingInput) => Promise<void>;
}) {
  const isEditing = Boolean(meeting);
  const initialStartsAt = meeting ? new Date(meeting.startsAt) : defaultDate;
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: meeting?.title ?? "",
      message: meeting?.message ?? "",
      location: meeting?.location ?? "",
      startDate: initialStartsAt,
      startTime: format(initialStartsAt, "HH:mm"),
    },
  });

  const titleValue = watch("title");

  const onSubmit = async (values: MeetingFormValues) => {
    const startsAt = toDateTime(values.startDate, values.startTime);

    try {
      setError(null);
      const input = {
        title: values.title.trim(),
        message: values.message?.trim() || undefined,
        startsAt: startsAt.toISOString(),
        location: values.location?.trim() || undefined,
      };

      if (isEditing && onUpdate) {
        await onUpdate(input);
      } else if (onCreate) {
        await onCreate(input);
      }
      onOpenChange(false);
    } catch (createError) {
      setError(
        getErrorMessage(
          createError,
          isEditing ? "Unable to update the meeting." : "Unable to create the meeting.",
        ),
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) =>
        !nextOpen && !isPending && onOpenChange(false)
      }
    >
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AppModalHeader
            title={isEditing ? "Edit meeting" : "Schedule meeting"}
            description={
              isEditing
                ? "Update the meeting details."
                : "Choose the date and time for the meeting."
            }
            icon={Users}
            onClose={() => onOpenChange(false)}
            closeLabel="Close meeting dialog"
            disabled={isPending}
          />
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="meeting-title">Title</Label>
              <Input
                id="meeting-title"
                placeholder="Weekly team sync"
                maxLength={500}
                autoFocus
                disabled={isPending}
                aria-invalid={Boolean(errors.title)}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Date and time</Label>
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger
                        className={cn(
                          "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-background px-2.5 text-left text-sm shadow-xs",
                          errors.startDate && "border-destructive",
                          isPending && "pointer-events-none opacity-50",
                        )}
                        aria-invalid={Boolean(errors.startDate)}
                        disabled={isPending}
                      >
                        {format(field.value, "MMM d, yyyy")}
                        <CalendarDays className="size-4 text-muted-foreground" />
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(nextDate) =>
                            nextDate && field.onChange(nextDate)
                          }
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <div className="space-y-2">
                  <Input
                    aria-label="Meeting time"
                    type="time"
                    disabled={isPending}
                    aria-invalid={Boolean(errors.startTime)}
                    {...register("startTime")}
                  />
                </div>
              </div>
              {(errors.startDate || errors.startTime) && (
                <p className="text-sm text-destructive">
                  {errors.startDate?.message ?? errors.startTime?.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-location">
                Location or meeting link{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="meeting-location"
                placeholder="Google Meet, Zoom, or a room name"
                maxLength={500}
                disabled={isPending}
                aria-invalid={Boolean(errors.location)}
                {...register("location")}
              />
              {errors.location && (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-message">
                Message for attendees{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="meeting-message"
                placeholder="Please join on time. We will discuss the sprint plan."
                maxLength={10000}
                rows={3}
                disabled={isPending}
                aria-invalid={Boolean(errors.message)}
                {...register("message")}
              />
              {errors.message && (
                <p className="text-sm text-destructive">
                  {errors.message.message}
                </p>
              )}
            </div>
            {error && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !titleValue?.trim()}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Save changes" : "Create meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
