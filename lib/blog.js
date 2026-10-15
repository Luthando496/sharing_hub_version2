// Small helpers shared by the blog pages, editor and tests.

// Columns for the list page and detail page. `author` joins the profiles table.
export const AUTHOR_COLUMNS = "author:profiles(first_name, last_name, avatar_url)";
export const POST_LIST_COLUMNS = `id, slug, title, subtitle, cover_image_url, published, published_at, created_at, updated_at, author_id, ${AUTHOR_COLUMNS}`;
export const POST_COLUMNS = `*, ${AUTHOR_COLUMNS}`;

export const COVER_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Roles allowed to write posts (the database enforces this too).
export function canWritePosts(role) {
  return role === "author" || role === "admin";
}

// "Why Exams Matter!" -> "why-exams-matter"
export function slugify(text) {
  const slug = String(text ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "post";
}

// Slug with a short random suffix so two posts with the same title never clash.
export function makeSlug(title) {
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slugify(title)}-${suffix}`;
}

export function readingTime(content) {
  const words = String(content ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// True when the post was edited after it was published (ignoring the first minute).
export function wasUpdated(post) {
  const start = post?.published_at || post?.created_at;
  if (!start || !post?.updated_at) return false;
  return new Date(post.updated_at) - new Date(start) > 60 * 1000;
}

export function authorName(author) {
  const name = `${author?.first_name ?? ""} ${author?.last_name ?? ""}`.trim();
  return name || "Anonymous";
}

export function initials(name) {
  return (
    String(name ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "?"
  );
}
