// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

// A fake Supabase query: every filter method returns itself, and awaiting it
// (or calling maybeSingle) gives back the result we choose.
function fakeQuery(result) {
  const q = {};
  for (const m of ["select", "order", "eq", "neq", "limit"]) q[m] = vi.fn(() => q);
  q.maybeSingle = vi.fn(() => Promise.resolve(result));
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return q;
}

let query;
const from = vi.fn(() => query);
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from }),
}));

import { fetchAllPosts, getPostById, getRelatedPosts } from "@/actions/resources";

const ID = "123e4567-e89b-42d3-a456-426614174000";
const row = (over = {}) => ({
  id: ID,
  title: "Chem notes",
  description: "",
  category: "Chemistry",
  type: "Notes",
  created_at: "2026-01-01T00:00:00Z",
  downloads: 3,
  thumbnail_url: null,
  file_name: "chem.pdf",
  file_url: "https://ik.imagekit.io/chem.pdf",
  author_id: "u1",
  ...over,
});

describe("fetchAllPosts", () => {
  it("returns every resource, newest first, in UI shape", async () => {
    query = fakeQuery({ data: [row(), row({ id: "2", title: "Other" })], error: null });

    const posts = await fetchAllPosts();

    expect(from).toHaveBeenCalledWith("resources");
    expect(query.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(posts).toHaveLength(2);
    expect(posts[0]).toMatchObject({ title: "Chem notes", fileURL: "https://ik.imagekit.io/chem.pdf", downloads: 3 });
  });

  it("returns an empty list instead of crashing when the database errors", async () => {
    query = fakeQuery({ data: null, error: new Error("table missing") });
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await fetchAllPosts()).toEqual([]);
  });
});

describe("getPostById", () => {
  it("returns null for ids that are not UUIDs, without querying", async () => {
    expect(await getPostById("abc")).toBeNull();
    expect(await getPostById(undefined)).toBeNull();
    expect(from).not.toHaveBeenCalled();
  });

  it("returns the resource for a valid id", async () => {
    query = fakeQuery({ data: row(), error: null });

    const post = await getPostById(ID);

    expect(query.eq).toHaveBeenCalledWith("id", ID);
    expect(post.title).toBe("Chem notes");
  });

  it("accepts the id as an array (Next.js route params)", async () => {
    query = fakeQuery({ data: row(), error: null });
    expect((await getPostById([ID])).id).toBe(ID);
  });

  it("returns null when nothing matches", async () => {
    query = fakeQuery({ data: null, error: null });
    expect(await getPostById(ID)).toBeNull();
  });
});

describe("getRelatedPosts", () => {
  it("looks in the same category and excludes the current post", async () => {
    query = fakeQuery({ data: [row({ id: "2" })], error: null });

    const related = await getRelatedPosts("Chemistry", ID);

    expect(query.eq).toHaveBeenCalledWith("category", "Chemistry");
    expect(query.neq).toHaveBeenCalledWith("id", ID);
    expect(query.limit).toHaveBeenCalledWith(3);
    expect(related).toHaveLength(1);
  });
});
