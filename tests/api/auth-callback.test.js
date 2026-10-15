// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession } }),
}));

import { GET } from "@/app/auth/callback/route";

const call = (query) => GET(new Request(`http://localhost:3000/auth/callback${query}`));
const location = (res) => res.headers.get("location");

describe("GET /auth/callback", () => {
  it("signs the user in and sends them to /resources by default", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const res = await call("?code=abc");

    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(location(res)).toBe("http://localhost:3000/resources");
  });

  it("honours a safe ?next= path", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const res = await call("?code=abc&next=/profile");
    expect(location(res)).toBe("http://localhost:3000/profile");
  });

  it.each(["//evil.com", "https://evil.com", "evil.com/x"])(
    "refuses to redirect off-site to %s",
    async (next) => {
      exchangeCodeForSession.mockResolvedValue({ error: null });
      const res = await call(`?code=abc&next=${encodeURIComponent(next)}`);
      expect(location(res)).toBe("http://localhost:3000/resources");
    }
  );

  it("sends the user back to /login when there is no code", async () => {
    const res = await call("");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(location(res)).toBe("http://localhost:3000/login?error=auth");
  });

  it("sends the user back to /login when the code is rejected", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("expired") });
    const res = await call("?code=bad");
    expect(location(res)).toBe("http://localhost:3000/login?error=auth");
  });
});
