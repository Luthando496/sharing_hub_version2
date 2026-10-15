// @vitest-environment node
import crypto from "node:crypto";
import { describe, it, expect, vi, beforeEach } from "vitest";

const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser } }),
}));

import { GET } from "@/app/api/imagekit-auth/route";

describe("GET /api/imagekit-auth", () => {
  beforeEach(() => {
    process.env.IMAGEKIT_PRIVATE_KEY = "private_test_key";
    process.env.IMAGEKIT_PUBLIC_KEY = "public_test_key";
  });

  it("refuses visitors who are not signed in", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const res = await GET();

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Not signed in" });
  });

  it("gives signed-in users a valid signature and never leaks the private key", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.publicKey).toBe("public_test_key");
    expect(JSON.stringify(body)).not.toContain("private_test_key");

    // ImageKit's rule: signature = HMAC-SHA1(token + expire, privateKey)
    const expected = crypto
      .createHmac("sha1", "private_test_key")
      .update(body.token + body.expire)
      .digest("hex");
    expect(body.signature).toBe(expected);

    // expires in the future, but soon
    const now = Math.floor(Date.now() / 1000);
    expect(body.expire).toBeGreaterThan(now);
    expect(body.expire).toBeLessThanOrEqual(now + 60 * 11);
  });

  it("is never cached", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const res = await GET();
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("reports a server error when ImageKit keys are missing", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    delete process.env.IMAGEKIT_PRIVATE_KEY;

    const res = await GET();
    expect(res.status).toBe(500);
  });
});
