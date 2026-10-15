// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ rpc }),
}));

import { POST } from "@/app/api/increment-download/route";

const ID = "123e4567-e89b-42d3-a456-426614174000";
const post = (body) =>
  POST(
    new Request("http://localhost/api/increment-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );

describe("POST /api/increment-download", () => {
  it("bumps the counter through the database function", async () => {
    rpc.mockResolvedValue({ error: null });

    const res = await post({ postId: ID });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith("increment_download", { p_resource_id: ID });
  });

  it.each([
    ["a missing id", {}],
    ["a non-uuid id", { postId: "not-a-uuid" }],
    ["a non-string id", { postId: 42 }],
  ])("rejects %s without touching the database", async (_label, body) => {
    const res = await post(body);
    expect(res.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects a body that is not JSON", async () => {
    const res = await post("not json at all");
    expect(res.status).toBe(400);
  });

  it("returns 500 when the database call fails", async () => {
    rpc.mockResolvedValue({ error: new Error("boom") });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await post({ postId: ID });
    expect(res.status).toBe(500);
  });
});
