import { MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/app/user-avatar";
import type { Comment } from "@/types/workspace";

type RecentCommentsProps = {
  comments: Comment[];
};

export function RecentComments({ comments }: RecentCommentsProps) {
  return (
    <section id="comments" className="scroll-mt-24" aria-label="Recent comments">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">Recent comments</h3>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <ul className="divide-y divide-border">
          {comments.map((comment) => (
            <li key={comment.id} className="p-4">
              <div className="flex gap-3">
                <UserAvatar name={comment.authorName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold">{comment.authorName}</p>
                    <span className="text-xs text-muted-foreground">
                      on {comment.taskTitle}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {comment.projectName}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground/90">
                    {comment.content}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageSquare className="size-3.5" />
                    {comment.createdAt}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
