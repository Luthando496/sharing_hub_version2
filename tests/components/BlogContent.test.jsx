import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BlogContent from "@/app/components/BlogContent";

describe("BlogContent", () => {
  it("turns blank-line separated text into paragraphs", () => {
    const { container } = render(<BlogContent content={"First paragraph.\n\nSecond paragraph."} />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveTextContent("First paragraph.");
    expect(paragraphs[1]).toHaveTextContent("Second paragraph.");
  });

  it("keeps a single Enter as a line break inside the paragraph", () => {
    const { container } = render(<BlogContent content={"line one\nline two"} />);
    expect(container.querySelectorAll("p")).toHaveLength(1);
    expect(container.querySelector("br")).not.toBeNull();
  });

  it("renders headings, bold, italics, lists and quotes", () => {
    const md = "## Big heading\n\nSome **bold** and *italic*.\n\n- one\n- two\n\n> a quote";
    const { container } = render(<BlogContent content={md} />);
    expect(screen.getByRole("heading", { level: 2, name: "Big heading" })).toBeInTheDocument();
    expect(container.querySelector("strong")).toHaveTextContent("bold");
    expect(container.querySelector("em")).toHaveTextContent("italic");
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.querySelector("blockquote")).toHaveTextContent("a quote");
  });

  it("shows optional images inside the content", () => {
    render(<BlogContent content={"Text\n\n![Campus](https://ik.imagekit.io/campus.png)"} />);
    const img = screen.getByRole("img", { name: "Campus" });
    expect(img).toHaveAttribute("src", "https://ik.imagekit.io/campus.png");
  });

  it("opens links in a new tab safely", () => {
    render(<BlogContent content="[SRC](https://example.com)" />);
    const link = screen.getByRole("link", { name: "SRC" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  describe("safety", () => {
    it("does not render raw HTML or scripts", () => {
      const { container } = render(
        <BlogContent content={'Hi <script>alert(1)</script> <img src=x onerror="alert(2)">'} />
      );
      expect(container.querySelector("script")).toBeNull();
      expect(container.querySelector("img")).toBeNull();
    });

    it("blocks javascript: links", () => {
      render(<BlogContent content="[click](javascript:alert(1))" />);
      const link = screen.queryByRole("link", { name: "click" });
      const href = link?.getAttribute("href") ?? "";
      expect(href.toLowerCase()).not.toContain("javascript:");
    });
  });

  it("handles empty content", () => {
    const { container } = render(<BlogContent content="" />);
    expect(container.querySelector(".blog-content")).toBeEmptyDOMElement();
  });
});
