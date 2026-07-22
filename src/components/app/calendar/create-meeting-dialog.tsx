"use client";

import { format } from "date-fns";
import { CalendarDays, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { cn } from "@/lib/utils";

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
}: {
  open: boolean;
  defaultDate: Date;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (meeting: MeetingInput) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const startsAt = toDateTime(startDate, startTime);

    try {
      setError(null);
      await onCreate({
        title,
        message: message || undefined,
        startsAt: startsAt.toISOString(),
        location: location || undefined,
      });
      setTitle("");
      setMessage("");
      setLocation("");
      setStartTime("09:00");
      onOpenChange(false);
    } catch (createError) {
      setError(getErrorMessage(createError, "Unable to create the meeting."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule meeting</DialogTitle>
          <DialogDescription>
            Choose the date and time for the meeting.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-2 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="meeting-title">Title</Label>
            <Input
              id="meeting-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Weekly team sync"
              maxLength={500}
              required
              disabled={isPending}
            />
          </div>

          <div>
            <DateTimeField
              label="Date and time"
              date={startDate}
              time={startTime}
              onDateChange={setStartDate}
              onTimeChange={setStartTime}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-location">Location or meeting link</Label>
            <Input
              id="meeting-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Google Meet, Zoom, or a room name"
              maxLength={500}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-message">Message for attendees</Label>
            <Textarea
              id="meeting-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Please join on time. We will discuss the sprint plan."
              maxLength={10000}
              rows={3}
              disabled={isPending}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Create meeting
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DateTimeField({
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  disabled,
}: {
  label: string;
  date: Date;
  time: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-3">
        <Popover>
          <PopoverTrigger
            className={cn(
              "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-background px-2.5 text-left text-sm shadow-xs",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {format(date, "MMM d, yyyy")}
            <CalendarDays className="size-4 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(nextDate) => nextDate && onDateChange(nextDate)}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
        <Input
          aria-label={`${label} time`}
          type="time"
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
