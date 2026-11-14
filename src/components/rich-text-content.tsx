"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { parseRichText } from "@/lib/rich-text";

export function RichTextContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const editor = useEditor(
    {
      extensions: [StarterKit],
      content: parseRichText(content),
      editable: false,
      immediatelyRender: false,
    },
    [content],
  );

  return (
    <div className={className ? `rich-text-content ${className}` : "rich-text-content"}>
      <EditorContent editor={editor} />
    </div>
  );
}
