import type { Metadata } from "next";
import { DashboardPage } from "@/components/app/dashboard/dashboard-page";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your NexTask dashboard — workspaces, projects, boards, tasks, and team activity in one place.",
};

export default function DashboardRoutePage() {
  return <DashboardPage />;
}
