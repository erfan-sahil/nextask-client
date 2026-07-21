"use client";

import { FolderKanban, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { appRoutes } from "@/config/navigation";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { useProjects, useWorkspaceBySlug } from "@/hooks/use-workflow";

export function WorkspacePage({ workspaceSlug }: { workspaceSlug: string }) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { workspace, isLoading, error } = useWorkspaceBySlug(workspaceSlug);
  const projects = useProjects(workspace?._id);

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading workspace…</div>;
  if (!workspace) return <div className="p-8 text-sm text-destructive">{error ? getErrorMessage(error) : "Workspace not found or you do not have access."}</div>;
  const workspaceId = workspace._id;

  async function createProject(event: React.FormEvent) {
    event.preventDefault();
    await projects.create.mutateAsync({ workspaceId, name, description });
    setName("");
    setDescription("");
    setIsCreating(false);
  }

  return (
    <div className="max-w-6xl px-4 py-6 sm:px-8">
      <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-1 bg-primary/20" />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">{workspace.name.slice(0, 2).toUpperCase()}</span>
            <div className="min-w-0 flex-1"><h1 className="text-2xl font-bold tracking-tight">{workspace.name}</h1><p className="mt-1 text-sm text-muted-foreground">{workspace.description}</p></div>
            <button onClick={() => setIsCreating(true)} className="hidden shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:flex"><Plus className="size-4" />New project</button>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm"><span className="text-muted-foreground">Projects </span><strong>{workspace.projectCount}</strong></div>
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm"><span className="text-muted-foreground">Members </span><strong>{workspace.memberCount}</strong></div>
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm"><span className="text-muted-foreground">Tasks </span><strong>{workspace.taskCount}</strong></div>
          </div>
        </div>
      </section>

      <div className="mb-5 flex items-center justify-between"><div><h2 className="text-base font-semibold">Projects</h2><p className="mt-0.5 text-xs text-muted-foreground">{projects.data?.pagination.total ?? 0} projects in this workspace</p></div><button onClick={() => setIsCreating(true)} className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"><Plus className="size-4" />New project</button></div>

      {isCreating && <form onSubmit={createProject} className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Project name" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" /><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description (optional)" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" /><div className="flex gap-2 sm:col-span-2"><button disabled={projects.create.isPending} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create project</button><button type="button" onClick={() => setIsCreating(false)} className="rounded-xl border border-border px-4 py-2 text-sm">Cancel</button></div></form>}

      {projects.isLoading ? <p className="py-12 text-sm text-muted-foreground">Loading projects…</p> : !projects.data?.projects.length ? <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border py-20 text-center"><FolderKanban className="mb-4 size-8 text-muted-foreground" /><p className="font-semibold">No projects yet</p><button onClick={() => setIsCreating(true)} className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">Create project</button></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{projects.data.projects.map((project) => <article key={project._id} className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg"><Link href={appRoutes.project(workspace.slug, project._id)}><h3 className="font-semibold group-hover:text-primary">{project.name}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p></Link><div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>{project.taskCount} tasks</span><span>{project.status.replace("_", " ")}</span></div><button onClick={() => { if (window.confirm(`Delete ${project.name}?`)) projects.remove.mutate({ workspaceId: workspace._id, projectId: project._id }); }} className="mt-4 flex items-center gap-1 text-xs text-destructive"><Trash2 className="size-3" />Delete</button></article>)}</div>}
    </div>
  );
}
