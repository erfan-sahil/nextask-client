"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type WorkspaceReportParams,
  workflowApi,
} from "@/lib/api/workflow";
import { workflowQueryKeys } from "@/lib/api/query-keys";

export function useWorkspaceReport(
  workspaceId: string | undefined,
  params: WorkspaceReportParams,
  enabled = true,
) {
  return useQuery({
    queryKey: [...workflowQueryKeys.reports(workspaceId ?? ""), params],
    queryFn: () => workflowApi.getWorkspaceReport(workspaceId!, params),
    enabled: Boolean(workspaceId) && enabled,
  });
}
