// Pure text helpers for the post editor's toolbar. Each takes the current text and
// the selection (start/end) and returns the new text plus where to put the cursor.

// Wrap the selection, e.g. **bold**. With nothing selected, insert the placeholder.
export function wrapSelection(text, start, end, before, after = before, placeholder = "text") {
  const selected = text.slice(start, end) || placeholder;
  const next = text.slice(0, start) + before + selected + after + text.slice(end);
  return {
    text: next,
    selectionStart: start + before.length,
    selectionEnd: start + before.length + selected.length,
  };
}

// Put a prefix (e.g. "## " or "- ") at the start of every line the selection touches.
export function prefixLines(text, start, end, prefix) {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = text.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;

  const block = text.slice(lineStart, lineEnd) || "text";
  const prefixed = block
    .split("\n")
    .map((line) => prefix + line)
    .join("\n");

  return {
    text: text.slice(0, lineStart) + prefixed + text.slice(lineEnd),
    selectionStart: lineStart,
    selectionEnd: lineStart + prefixed.length,
  };
}

// Insert an image on its own paragraph at the cursor.
export function insertImage(text, start, end, url, alt = "") {
  const markdown = `![${alt}](${url})`;
  const before = text.slice(0, start);
  const after = text.slice(end);
  const lead = before === "" || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const trail = after === "" || after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
  const inserted = lead + markdown + trail;
  const cursor = before.length + inserted.length;
  return { text: before + inserted + after, selectionStart: cursor, selectionEnd: cursor };
}
