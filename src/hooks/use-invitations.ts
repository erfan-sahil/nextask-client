"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { workflowApi } from "@/lib/api/workflow";
import { authQueryKeys } from "@/lib/api/query-keys";

export function useWorkspaceInvitation(token: string) {
  const preview = useQuery({
    queryKey: authQueryKeys.workspaceInvitation(token),
    queryFn: () => workflowApi.previewWorkspaceInvitation(token),
    enabled: Boolean(token),
  });

  return {
    preview,
    accept: useMutation({
      mutationFn: () => workflowApi.acceptWorkspaceInvitation(token),
    }),
  };
}

export function useProjectInvitation(token: string) {
  const preview = useQuery({
    queryKey: authQueryKeys.projectInvitation(token),
    queryFn: () => workflowApi.previewProjectInvitation(token),
    enabled: Boolean(token),
  });

  return {
    preview,
    accept: useMutation({
      mutationFn: () => workflowApi.acceptProjectInvitation(token),
    }),
  };
}
