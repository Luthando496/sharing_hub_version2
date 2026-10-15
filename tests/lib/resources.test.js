import { describe, it, expect } from "vitest";
import { toResource, downloadUrl } from "@/lib/resources";

describe("toResource", () => {
  it("maps a database row to the shape the UI uses", () => {
    const row = {
      id: "abc",
      title: "Calculus notes",
      description: "Limits and derivatives",
      category: "Mathematics",
      type: "Notes",
      created_at: "2026-01-02T10:00:00Z",
      downloads: 7,
      thumbnail_url: "https://ik.imagekit.io/x/thumb.png",
      file_name: "calc.pdf",
      file_url: "https://ik.imagekit.io/x/calc.pdf",
      author_id: "user-1",
    };

    expect(toResource(row)).toEqual({
      id: "abc",
      title: "Calculus notes",
      description: "Limits and derivatives",
      category: "Mathematics",
      type: "Notes",
      uploadDate: "2026-01-02T10:00:00Z",
      downloads: 7,
      image: "https://ik.imagekit.io/x/thumb.png",
      fileName: "calc.pdf",
      fileURL: "https://ik.imagekit.io/x/calc.pdf",
      authorId: "user-1",
    });
  });

  it("falls back to safe empty values when columns are null", () => {
    const result = toResource({ id: "abc" });
    expect(result.title).toBe("");
    expect(result.downloads).toBe(0);
    expect(result.image).toBe("");
    expect(result.fileURL).toBe("");
  });
});

describe("downloadUrl", () => {
  it("adds the ImageKit force-download flag", () => {
    expect(downloadUrl("https://ik.imagekit.io/x/a.pdf")).toBe(
      "https://ik.imagekit.io/x/a.pdf?ik-attachment=true"
    );
  });

  it("appends with & when the URL already has a query string", () => {
    expect(downloadUrl("https://ik.imagekit.io/x/a.pdf?tr=w-100")).toBe(
      "https://ik.imagekit.io/x/a.pdf?tr=w-100&ik-attachment=true"
    );
  });

  it("returns an empty string when there is no file", () => {
    expect(downloadUrl("")).toBe("");
    expect(downloadUrl(undefined)).toBe("");
  });
});
