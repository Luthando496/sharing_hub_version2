// Shared helpers for turning `resources` table rows into the shape the UI uses.

export function toResource(row) {
  return {
    id: row.id,
    title: row.title || "",
    description: row.description || "",
    category: row.category || "",
    type: row.type || "",
    uploadDate: row.created_at || "",
    downloads: row.downloads || 0,
    image: row.thumbnail_url || "",
    fileName: row.file_name || "",
    fileURL: row.file_url || "",
    authorId: row.author_id || "",
  };
}

// ImageKit serves the file inline by default; this makes the browser download it.
export function downloadUrl(fileURL) {
  if (!fileURL) return "";
  return fileURL + (fileURL.includes("?") ? "&" : "?") + "ik-attachment=true";
}

export const RESOURCE_COLUMNS =
  "id, title, description, category, type, file_url, file_name, thumbnail_url, downloads, created_at, author_id";
