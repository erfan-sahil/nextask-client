import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Sign in to your NexTask account to access workspaces, projects, and tasks.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md border-border/80 shadow-lg shadow-primary/5">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <LogIn className="size-5" aria-hidden />
        </div>
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription className="text-base leading-6">
          Log in to access your workspaces, projects, and tasks. Authentication
          will be available here soon.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full rounded-full hover:bg-primary-hover" disabled>
          Continue to NexTask
        </Button>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full rounded-full",
          )}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to landing page
        </Link>
      </CardContent>
    </Card>
  );
}
