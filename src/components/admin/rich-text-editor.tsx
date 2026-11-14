"use client";

import { useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { parseRichText } from "@/lib/rich-text";

type RichTextEditorProps = {
  name: string;
  initialContent?: string;
  label: string;
};

function ToolbarButton({
  active,
  label,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={active ? "is-active" : undefined}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
      type="button"
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  name,
  initialContent = "",
  label,
}: RichTextEditorProps) {
  const [value, setValue] = useState(() => JSON.stringify(parseRichText(initialContent)));
  const editor = useEditor(
    {
      extensions: [StarterKit],
      content: parseRichText(initialContent),
      immediatelyRender: false,
      onUpdate: ({ editor: currentEditor }) => {
        setValue(JSON.stringify(currentEditor.getJSON()));
      },
    },
    [initialContent],
  );
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return null;
      const { selection } = currentEditor.state;
      const parent = selection.$from.parent;
      let listType: string | null = null;
      let blockquote = false;
      for (let depth = selection.$from.depth; depth > 0; depth -= 1) {
        const nodeType = selection.$from.node(depth).type.name;
        if (nodeType === "orderedList" || nodeType === "bulletList") {
          listType = nodeType;
        } else if (nodeType === "blockquote") {
          blockquote = true;
        }
      }

      return {
          paragraph:
            parent.type.name === "paragraph" && listType === null && !blockquote,
          bold: currentEditor.isActive("bold"),
          italic: currentEditor.isActive("italic"),
          strike: currentEditor.isActive("strike"),
          heading1: parent.type.name === "heading" && parent.attrs.level === 1,
          heading2: parent.type.name === "heading" && parent.attrs.level === 2,
          bulletList: listType === "bulletList",
          orderedList: listType === "orderedList",
          blockquote,
          canUndo: currentEditor.can().undo(),
          canRedo: currentEditor.can().redo(),
        };
    },
  });

  return (
    <div className="rich-text-field">
      <span className="rich-text-label">{label}</span>
      <div className="rich-text-editor">
        <div aria-label={`${label} formatting`} className="rich-text-toolbar" role="toolbar">
          <ToolbarButton active={toolbarState?.paragraph ?? false} disabled={!editor} label="Paragraph" onClick={() => editor?.chain().focus().setParagraph().run()}>
            <Pilcrow aria-hidden="true" size={15} />
          </ToolbarButton>
          <ToolbarButton active={toolbarState?.bold ?? false} disabled={!editor} label="Bold" onClick={() => editor?.chain().focus().toggleBold().run()}>
            <Bold aria-hidden="true" size={15} />
          </ToolbarButton>
          <ToolbarButton active={toolbarState?.italic ?? false} disabled={!editor} label="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()}>
            <Italic aria-hidden="true" size={15} />
          </ToolbarButton>
          <ToolbarButton active={toolbarState?.heading1 ?? false} disabled={!editor} label="Heading 1" onClick={() => editor?.chain().focus().setNode("heading", { level: 1 }).run()}>
            <Heading1 aria-hidden="true" size={15} />
          </ToolbarButton>
          <ToolbarButton active={toolbarState?.heading2 ?? false} disabled={!editor} label="Heading 2" onClick={() => editor?.chain().focus().setNode("heading", { level: 2 }).run()}>
            <Heading2 aria-hidden="true" size={15} />
          </ToolbarButton>
          <ToolbarButton active={toolbarState?.strike ?? false} disabled={!editor} label="Strikethrough" onClick={() => editor?.chain().focus().toggleStrike().run()}>
            <Strikethrough aria-hidden="true" size={15} />
          </ToolbarButton>
          <ToolbarButton active={toolbarState?.bulletList ?? false} disabled={!editor} label="Bulleted list" onClick={() => editor?.chain().focus().toggleList("bulletList", "listItem").run()}>
            <List aria-hidden="true" size={15} />
          </ToolbarButton>
          <ToolbarButton active={toolbarState?.orderedList ?? false} disabled={!editor} label="Numbered list" onClick={() => editor?.chain().focus().toggleList("orderedList", "listItem").run()}>
            <ListOrdered aria-hidden="true" size={15} />
          </ToolbarButton>
          <ToolbarButton active={toolbarState?.blockquote ?? false} disabled={!editor} label="Blockquote" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
            <Quote aria-hidden="true" size={15} />
          </ToolbarButton>
          <ToolbarButton disabled={!editor || !toolbarState?.canUndo} label="Undo" onClick={() => editor?.chain().focus().undo().run()}>
            <Undo2 aria-hidden="true" size={15} />
          </ToolbarButton>
          <ToolbarButton disabled={!editor || !toolbarState?.canRedo} label="Redo" onClick={() => editor?.chain().focus().redo().run()}>
            <Redo2 aria-hidden="true" size={15} />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      <input name={name} type="hidden" value={value} />
    </div>
  );
}
