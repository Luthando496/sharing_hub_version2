import { describe, it, expect } from "vitest";
import { wrapSelection, prefixLines, insertImage } from "@/lib/editor";

describe("wrapSelection", () => {
  it("wraps the selected text", () => {
    const r = wrapSelection("hello world", 6, 11, "**");
    expect(r.text).toBe("hello **world**");
    expect(r.text.slice(r.selectionStart, r.selectionEnd)).toBe("world");
  });

  it("inserts a placeholder when nothing is selected", () => {
    const r = wrapSelection("", 0, 0, "**", "**", "bold text");
    expect(r.text).toBe("**bold text**");
    expect(r.text.slice(r.selectionStart, r.selectionEnd)).toBe("bold text");
  });

  it("supports different opening and closing marks (links)", () => {
    const r = wrapSelection("see this", 4, 8, "[", "](https://)");
    expect(r.text).toBe("see [this](https://)");
  });
});

describe("prefixLines", () => {
  it("prefixes the current line", () => {
    const r = prefixLines("one\ntwo\nthree", 5, 5, "## ");
    expect(r.text).toBe("one\n## two\nthree");
  });

  it("prefixes every line the selection touches", () => {
    const r = prefixLines("one\ntwo\nthree", 2, 9, "- ");
    expect(r.text).toBe("- one\n- two\n- three");
  });

  it("works on an empty editor", () => {
    expect(prefixLines("", 0, 0, "> ").text).toBe("> text");
  });
});

describe("insertImage", () => {
  const url = "https://ik.imagekit.io/pic.png";

  it("puts the image on its own paragraph in the middle of text", () => {
    const r = insertImage("Before after", 7, 7, url, "pic");
    expect(r.text).toBe(`Before \n\n![pic](${url})\n\nafter`);
  });

  it("doesn't add extra blank lines in an empty editor", () => {
    expect(insertImage("", 0, 0, url, "pic").text).toBe(`![pic](${url})`);
  });

  it("places the cursor after the image", () => {
    const r = insertImage("Hello", 5, 5, url, "pic");
    expect(r.selectionStart).toBe(r.text.length);
  });
});
