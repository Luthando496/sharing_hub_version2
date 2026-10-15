import { describe, it, expect } from "vitest";
import {
  slugify,
  makeSlug,
  readingTime,
  formatDate,
  wasUpdated,
  authorName,
  initials,
  canWritePosts,
} from "@/lib/blog";

describe("slugify", () => {
  it("makes a url-friendly slug", () => {
    expect(slugify("Why Exams Matter!")).toBe("why-exams-matter");
  });

  it("removes accents and extra symbols", () => {
    expect(slugify("  Café — SRC's   Plan  ")).toBe("cafe-src-s-plan");
  });

  it("falls back to 'post' when nothing usable is left", () => {
    expect(slugify("!!!")).toBe("post");
    expect(slugify("")).toBe("post");
    expect(slugify(undefined)).toBe("post");
  });

  it("keeps slugs short and never ends with a dash", () => {
    const slug = slugify("a".repeat(59) + " bbbbbbbbbb");
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("makeSlug", () => {
  it("adds a random suffix so equal titles don't clash", () => {
    const a = makeSlug("Same Title");
    const b = makeSlug("Same Title");
    expect(a).toMatch(/^same-title-[a-z0-9]+$/);
    expect(a).not.toBe(b);
  });
});

describe("readingTime", () => {
  it("is at least one minute", () => {
    expect(readingTime("")).toBe(1);
    expect(readingTime("just a few words")).toBe(1);
  });

  it("rounds up at about 200 words a minute", () => {
    expect(readingTime("word ".repeat(200))).toBe(1);
    expect(readingTime("word ".repeat(201))).toBe(2);
    expect(readingTime("word ".repeat(1000))).toBe(5);
  });
});

describe("formatDate", () => {
  it("formats an ISO date for readers", () => {
    expect(formatDate("2026-03-05T10:00:00Z")).toBe("March 5, 2026");
  });

  it("returns an empty string with no date", () => {
    expect(formatDate(null)).toBe("");
  });
});

describe("wasUpdated", () => {
  const base = { published_at: "2026-03-05T10:00:00Z" };

  it("is false when edited within the first minute", () => {
    expect(wasUpdated({ ...base, updated_at: "2026-03-05T10:00:30Z" })).toBe(false);
  });

  it("is true when edited later", () => {
    expect(wasUpdated({ ...base, updated_at: "2026-03-07T09:00:00Z" })).toBe(true);
  });

  it("falls back to created_at for drafts", () => {
    expect(
      wasUpdated({ created_at: "2026-03-05T10:00:00Z", updated_at: "2026-03-06T10:00:00Z" })
    ).toBe(true);
  });

  it("is false when dates are missing", () => {
    expect(wasUpdated({})).toBe(false);
    expect(wasUpdated(null)).toBe(false);
  });
});

describe("author helpers", () => {
  it("builds the author's full name", () => {
    expect(authorName({ first_name: "Ada", last_name: "Lovelace" })).toBe("Ada Lovelace");
    expect(authorName({ first_name: "Ada", last_name: "" })).toBe("Ada");
  });

  it("uses Anonymous when there is no author", () => {
    expect(authorName(null)).toBe("Anonymous");
    expect(authorName({ first_name: "", last_name: "" })).toBe("Anonymous");
  });

  it("makes initials", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials("ada")).toBe("A");
    expect(initials("")).toBe("?");
  });
});

describe("canWritePosts", () => {
  it("allows authors and admins only", () => {
    expect(canWritePosts("author")).toBe(true);
    expect(canWritePosts("admin")).toBe(true);
    expect(canWritePosts("student")).toBe(false);
    expect(canWritePosts(null)).toBe(false);
    expect(canWritePosts(undefined)).toBe(false);
  });
});
