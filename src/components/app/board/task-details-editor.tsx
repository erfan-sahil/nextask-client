"use client";

import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Type,
  Underline,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type TaskDetailsEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

type EditorAction = {
  command: string;
  value?: string;
  icon: LucideIcon;
  label: string;
};

const editorActions: EditorAction[] = [
  { command: "bold", icon: Bold, label: "Bold" },
  { command: "italic", icon: Italic, label: "Italic" },
  { command: "underline", icon: Underline, label: "Underline" },
  { command: "insertUnorderedList", icon: List, label: "Bulleted list" },
  { command: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
  { command: "formatBlock", value: "blockquote", icon: Quote, label: "Quote" },
  { command: "formatBlock", value: "h2", icon: Heading2, label: "Heading" },
];

function hasMeaningfulContent(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
}

export function TaskDetailsEditor({
  value,
  onChange,
  disabled = false,
}: TaskDetailsEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      lastValueRef.current = value;
    }
  }, [value]);

  function emitChange() {
    const nextValue = editorRef.current?.innerHTML ?? "";
    lastValueRef.current = nextValue;
    onChange(hasMeaningfulContent(nextValue) ? nextValue : "");
  }

  function applyFormat(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  }

  function resetFormatting() {
    editorRef.current?.focus();

    if (document.queryCommandState("insertUnorderedList")) {
      document.execCommand("insertUnorderedList");
    }
    if (document.queryCommandState("insertOrderedList")) {
      document.execCommand("insertOrderedList");
    }

    document.execCommand("removeFormat");
    document.execCommand("formatBlock", false, "p");
    emitChange();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-1.5">
        <span className="group relative">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={disabled}
            aria-label="Normal text"
            onMouseDown={(event) => event.preventDefault()}
            onClick={resetFormatting}
          >
            <Type className="size-3.5" />
          </Button>
          <span
            role="tooltip"
            className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          >
            Normal text
          </span>
        </span>
        {editorActions.map(({ command, value: commandValue, icon: Icon, label }) => {
          return (
            <span key={label} className="group relative">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={disabled}
                aria-label={label}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyFormat(command, commandValue)}
              >
                <Icon className="size-3.5" />
              </Button>
              <span
                role="tooltip"
                className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
              >
                {label}
              </span>
            </span>
          );
        })}
      </div>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-label="Task details"
        aria-multiline="true"
        data-placeholder="Add context, requirements, links, or a checklist…"
        onInput={emitChange}
        onBlur={emitChange}
        className="task-details-editor min-h-32 px-3 py-2.5 text-sm leading-6 text-foreground outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
      />
    </div>
  );
}
