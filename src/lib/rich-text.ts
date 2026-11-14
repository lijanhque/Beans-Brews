import type { JSONContent } from "@tiptap/core";

function isRichTextDocument(value: unknown): value is JSONContent {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "doc" &&
    (!("content" in value) || Array.isArray(value.content))
  );
}

export function parseRichText(content: string): JSONContent {
  try {
    const parsed: unknown = JSON.parse(content);
    if (isRichTextDocument(parsed)) return parsed;
  } catch {
    // Older product and blog entries are stored as plain text.
  }

  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: "paragraph",
      content: [{ type: "text", text: paragraph }],
    }));

  return {
    type: "doc",
    content: paragraphs.length > 0 ? paragraphs : [{ type: "paragraph" }],
  };
}

export function richTextToPlainText(content: string): string {
  const document = parseRichText(content);

  function collectText(node: JSONContent): string {
    if (node.text) return node.text;
    return (node.content ?? []).map(collectText).join("");
  }

  return (document.content ?? [])
    .map(collectText)
    .filter(Boolean)
    .join(" ")
    .trim();
}
