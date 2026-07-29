"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/app/user-avatar";
import {
  useWorkspaceChat,
  useWorkspaceChatParticipants,
} from "@/hooks/use-workflow";
import { useAuth } from "@/hooks/use-auth";
import { socket } from "@/lib/socket";
import type { WorkspaceDoc } from "@/types/domain";

const unreadStorageKey = (workspaceId: string) => `nextask-chat-unread:${workspaceId}`;

function renderMessageContent(content: string, isOwnMessage: boolean) {
  const mentionClassName = isOwnMessage
    ? "inline-block rounded-md bg-primary-foreground/15 px-1.5 py-0.5 font-semibold text-primary-foreground"
    : "inline-block rounded-md bg-primary/10 px-1.5 py-0.5 font-semibold text-primary";

  return content.split(/(@[a-z0-9_-]+)/gi).map((part, index) =>
    /^@[a-z0-9_-]+$/i.test(part) ? (
      <span key={`${part}-${index}`} className={mentionClassName}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function WorkspaceChat({ workspace }: { workspace?: WorkspaceDoc }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [typingUserIds, setTypingUserIds] = useState<Set<string>>(new Set());
  const [mention, setMention] = useState<{ query: string; start: number } | null>(null);
  const [debouncedMentionQuery, setDebouncedMentionQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unreadCountRef = useRef(0);
  const chat = useWorkspaceChat(workspace?._id);
  const participants = useWorkspaceChatParticipants(workspace?._id);
  const { user } = useAuth();
  const messages = chat.data?.messages ?? [];
  const mentionSuggestions = (participants.data ?? [])
    .filter((user) => {
      const query = debouncedMentionQuery.toLowerCase();
      const name = `${user.firstName} ${user.lastName}`.toLowerCase();
      return !query || user.username.includes(query) || name.includes(query);
    })
    .slice(0, 5);

  const handleOpenChat = useCallback(() => {
    setIsOpen(true);

    unreadCountRef.current = 0;
    setUnreadCount(0);
    if (workspace) localStorage.removeItem(unreadStorageKey(workspace._id));
    window.dispatchEvent(new CustomEvent("workspace-chat:unread", { detail: 0 }));
  }, [workspace]);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages.length]);

  useEffect(() => {
    window.addEventListener("workspace-chat:open", handleOpenChat);
    return () => window.removeEventListener("workspace-chat:open", handleOpenChat);
  }, [handleOpenChat]);

  useEffect(() => {
    if (!workspace) return;
    const handleTyping = ({
      userId,
      isTyping,
    }: {
      userId: string;
      isTyping: boolean;
    }) => {
      setTypingUserIds((current) => {
        const next = new Set(current);
        if (isTyping) next.add(userId);
        else next.delete(userId);
        return next;
      });
    };
    socket.on("chat:typing", handleTyping);
    return () => {
      socket.off("chat:typing", handleTyping);
    };
  }, [workspace]);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedMentionQuery(mention?.query ?? ""),
      250,
    );
    return () => window.clearTimeout(timeout);
  }, [mention?.query]);

  useEffect(() => {
    if (!workspace) return;
    const handleMessage = () => {
      if (isOpen) return;
      const nextUnreadCount = unreadCountRef.current + 1;
      unreadCountRef.current = nextUnreadCount;
      setUnreadCount(nextUnreadCount);
      localStorage.setItem(unreadStorageKey(workspace._id), String(nextUnreadCount));
      window.dispatchEvent(
        new CustomEvent("workspace-chat:unread", { detail: nextUnreadCount }),
      );
    };
    socket.on("chat:message", handleMessage);
    return () => socket.off("chat:message", handleMessage);
  }, [isOpen, workspace]);

  if (!workspace) return null;

  function stopTyping() {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socket.emit("chat:stop-typing", workspace._id);
  }

  function announceTyping() {
    socket.emit("chat:typing", workspace._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 1200);
  }

  function updateMention(value: string, caretPosition: number) {
    const textBeforeCaret = value.slice(0, caretPosition);
    const match = textBeforeCaret.match(/@([a-z0-9_-]*)$/i);
    setMention(match ? { query: match[1], start: caretPosition - match[0].length } : null);
  }

  function selectMention(username: string) {
    if (!mention) return;
    const caretPosition = composerRef.current?.selectionStart ?? content.length;
    const nextContent = `${content.slice(0, mention.start)}@${username} ${content.slice(caretPosition)}`;
    setContent(nextContent);
    setMention(null);
    requestAnimationFrame(() => composerRef.current?.focus());
  }

  async function sendMessage() {
    const message = content.trim();
    if (!message || !workspace) return;
    await chat.create.mutateAsync({ workspaceId: workspace._id, content: message });
    setContent("");
    stopTyping();
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        className="fixed right-5 bottom-5 z-40 size-12 rounded-full shadow-lg"
        aria-label="Open workspace chat"
        onClick={handleOpenChat}
      >
        <MessageCircle className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
      {isOpen && (
        <section className="fixed right-4 bottom-4 z-50 flex h-[min(40rem,calc(100svh-2rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/10 sm:right-6 sm:bottom-6">
          <header className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageCircle className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">Workspace chat</h2>
                <p className="truncate text-xs text-muted-foreground">{workspace.name}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X className="size-4" />
            </Button>
          </header>
          <ScrollArea
            className="min-h-0 flex-1 bg-muted/10"
            style={{
              backgroundImage:
                "linear-gradient(to right, color-mix(in srgb, var(--border) 24%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--border) 24%, transparent) 1px, transparent 1px), linear-gradient(to right, color-mix(in srgb, var(--border) 50%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--border) 50%, transparent) 1px, transparent 1px)",
              backgroundSize: "24px 24px, 24px 24px, 96px 96px, 96px 96px",
            }}
          >
            <div className="space-y-5 px-4 py-5">
            {chat.isLoading ? (
              <p className="text-center text-sm text-muted-foreground">Loading messages…</p>
            ) : null}
            {!chat.isLoading && !messages.length ? (
              <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
                <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MessageCircle className="size-5" aria-hidden />
                </span>
                <p className="text-sm font-medium">Start the conversation</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Use @username to mention a teammate.
                </p>
              </div>
            ) : null}
            {messages.map((message) => {
              const name = `${message.createdBy.firstName} ${message.createdBy.lastName}`.trim();
              const isOwnMessage = message.createdBy._id === user?._id;
              return (
                <article
                  key={message._id}
                  className={`flex animate-in items-start gap-2.5 fade-in-0 duration-200 ${
                    isOwnMessage ? "flex-row-reverse slide-in-from-right-2" : "slide-in-from-left-2"
                  }`}
                >
                  <UserAvatar name={name} avatar={message.createdBy.avatar} size="sm" className="mt-0.5" />
                  <div className="min-w-0 max-w-[calc(100%-2.5rem)]">
                    <div
                      className={
                        isOwnMessage
                          ? "rounded-2xl rounded-tr-md bg-primary px-3.5 py-2.5 text-primary-foreground shadow-sm"
                          : "rounded-2xl rounded-tl-md border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 shadow-sm dark:border-emerald-900 dark:bg-emerald-950"
                      }
                    >
                      {!isOwnMessage && <p className="text-xs font-semibold text-foreground">{name}</p>}
                      <p className={`whitespace-pre-wrap text-sm leading-5 ${isOwnMessage ? "text-primary-foreground" : "mt-1 text-foreground/90"}`}>
                        {renderMessageContent(message.content, isOwnMessage)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
            {typingUserIds.size > 0 && (
              <div className="mb-4 flex w-fit rounded-2xl rounded-tl-md border border-border/70 bg-card px-4 py-3 shadow-sm" aria-live="polite">
                <span className="sr-only">{typingUserIds.size === 1 ? "Someone is typing" : "People are typing"}</span>
                <span className="flex items-center gap-1.5" aria-hidden>
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </span>
              </div>
            )}
            <div ref={endRef} />
            </div>
          </ScrollArea>
          <div className="flex gap-2 border-t border-border bg-card p-3">
            <div className="relative min-w-0 flex-1">
              <Textarea
                ref={composerRef}
                value={content}
                onChange={(event) => {
                  const value = event.target.value;
                  setContent(value);
                  updateMention(value, event.target.selectionStart);
                  if (value.trim()) announceTyping();
                  else stopTyping();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                  if (event.key === "Escape") setMention(null);
                }}
                placeholder="Message #workspace…"
                rows={2}
                className="min-h-20 resize-none rounded-xl border-border bg-muted/20 px-3 py-2.5 text-sm shadow-none placeholder:text-muted-foreground/80 focus-visible:bg-background"
              />
              {mention && (
                <div className="absolute right-0 bottom-[calc(100%+0.5rem)] left-0 z-10 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg">
                  {mentionSuggestions.map((user) => {
                    const name = `${user.firstName} ${user.lastName}`.trim();
                    return (
                      <button
                        key={user._id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectMention(user.username)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-emerald-500/5"
                      >
                        <UserAvatar name={name} avatar={user.avatar} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{name}</span>
                          <span className="block truncate text-xs text-muted-foreground">@{user.username}</span>
                        </span>
                      </button>
                    );
                  })}
                  {!participants.isLoading && !mentionSuggestions.length && (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground">No matching members</p>
                  )}
                </div>
              )}
            </div>
            <Button size="icon" className="shrink-0 self-end rounded-xl" onClick={() => void sendMessage()} disabled={!content.trim() || chat.create.isPending} aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
