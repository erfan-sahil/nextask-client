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
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel: string;
  placeholder: string;
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

const FORMATTED_BLOCK_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
]);

const INLINE_FORMAT_COMMANDS = ["bold", "italic", "underline"] as const;

function hasMeaningfulContent(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
}

function normalizeBlockTag(value: string) {
  return value.replace(/[<>]/g, "").toLowerCase();
}

function isActionActive(command: string, commandValue?: string) {
  if (typeof document === "undefined") return false;

  if (command === "formatBlock" && commandValue) {
    const block = normalizeBlockTag(document.queryCommandValue("formatBlock"));
    return block === normalizeBlockTag(commandValue);
  }

  return document.queryCommandState(command);
}

function runFormatBlock(tag: string) {
  const normalized = normalizeBlockTag(tag);
  return (
    document.execCommand("formatBlock", false, normalized) ||
    document.execCommand("formatBlock", false, `<${normalized}>`)
  );
}

function findClosestFormattedBlock(node: Node | null, editor: HTMLElement) {
  let current: Node | null = node;

  while (current && current !== editor) {
    if (current instanceof HTMLElement) {
      const tag = current.tagName.toLowerCase();
      if (FORMATTED_BLOCK_TAGS.has(tag)) {
        return current;
      }
    }
    current = current.parentNode;
  }

  return null;
}

function ToolbarTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="group relative">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  ariaLabel,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);
  const [activeCommands, setActiveCommands] = useState<Record<string, boolean>>(
    {},
  );

  const syncActiveCommands = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !editor.contains(document.activeElement)) {
      setActiveCommands({});
      return;
    }

    const nextState: Record<string, boolean> = {
      "normal-text": !editorActions.some(({ command, value: commandValue }) =>
        isActionActive(command, commandValue),
      ),
    };

    for (const { command, value: commandValue, label } of editorActions) {
      nextState[label] = isActionActive(command, commandValue);
    }

    setActiveCommands(nextState);
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      lastValueRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    document.addEventListener("selectionchange", syncActiveCommands);
    return () => {
      document.removeEventListener("selectionchange", syncActiveCommands);
    };
  }, [syncActiveCommands]);

  function emitChange() {
    const nextValue = editorRef.current?.innerHTML ?? "";
    lastValueRef.current = nextValue;
    onChange(hasMeaningfulContent(nextValue) ? nextValue : "");
    syncActiveCommands();
  }

  function ensureEditorSelection() {
    const editor = editorRef.current;
    if (!editor) return false;

    editor.focus();

    const selection = window.getSelection();
    if (!selection) return false;

    if (
      selection.rangeCount === 0 ||
      !selection.anchorNode ||
      !editor.contains(selection.anchorNode)
    ) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    return true;
  }

  function applyFormat(command: string, commandValue?: string) {
    if (disabled || !ensureEditorSelection()) return;

    if (command === "formatBlock" && commandValue) {
      runFormatBlock(commandValue);
    } else {
      document.execCommand(command, false, commandValue);
    }

    emitChange();
  }

  function resetFormatting() {
    const editor = editorRef.current;
    if (disabled || !editor || !ensureEditorSelection()) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Only toggle off list formatting at the current caret/selection.
    if (document.queryCommandState("insertUnorderedList")) {
      document.execCommand("insertUnorderedList", false);
    }
    if (document.queryCommandState("insertOrderedList")) {
      document.execCommand("insertOrderedList", false);
    }

    // Convert only the current heading/quote block to a paragraph.
    // Keep its inner content so earlier text elsewhere is untouched.
    const formattedBlock = findClosestFormattedBlock(
      selection.anchorNode,
      editor,
    );

    if (formattedBlock) {
      const paragraph = document.createElement("p");
      paragraph.innerHTML = formattedBlock.innerHTML || "<br>";
      formattedBlock.replaceWith(paragraph);

      const range = document.createRange();
      range.selectNodeContents(paragraph);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      runFormatBlock("p");
    }

    // Clear inline styles only for the current selection.
    // If the caret is collapsed, just turn off active inline modes for new typing.
    if (!selection.isCollapsed) {
      document.execCommand("removeFormat", false);
      document.execCommand("unlink", false);
    } else {
      for (const command of INLINE_FORMAT_COMMANDS) {
        if (document.queryCommandState(command)) {
          document.execCommand(command, false);
        }
      }
    }

    editor.focus();
    emitChange();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-1.5">
        <ToolbarTooltip label="Normal text">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={disabled}
            aria-label="Normal text"
            aria-pressed={Boolean(activeCommands["normal-text"])}
            onMouseDown={(event) => {
              event.preventDefault();
              resetFormatting();
            }}
            className={cn(
              activeCommands["normal-text"] && "text-primary hover:text-primary",
            )}
          >
            <Type className="size-3.5" />
          </Button>
        </ToolbarTooltip>
        {editorActions.map(({ command, value: commandValue, icon: Icon, label }) => {
          const isActive = Boolean(activeCommands[label]);

          return (
            <ToolbarTooltip key={label} label={label}>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={disabled}
                aria-label={label}
                aria-pressed={isActive}
                onMouseDown={(event) => {
                  event.preventDefault();
                  applyFormat(command, commandValue);
                }}
                className={cn(isActive && "text-primary hover:text-primary")}
              >
                <Icon className="size-3.5" />
              </Button>
            </ToolbarTooltip>
          );
        })}
      </div>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-label={ariaLabel}
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        onKeyUp={syncActiveCommands}
        onMouseUp={syncActiveCommands}
        className="min-h-32 px-3 py-2.5 text-sm leading-6 text-foreground outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
      />
    </div>
  );
}
