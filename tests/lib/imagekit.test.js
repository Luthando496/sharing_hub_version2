import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadToImageKit } from "@/lib/imagekit";

const json = (body, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

describe("uploadToImageKit", () => {
  const file = new File(["hello"], "notes.pdf", { type: "application/pdf" });

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("gets a signature, then uploads the file to ImageKit and returns the result", async () => {
    fetch
      .mockReturnValueOnce(
        json({ token: "tok", expire: 123, signature: "sig", publicKey: "pub" })
      )
      .mockReturnValueOnce(json({ url: "https://ik.imagekit.io/x/notes.pdf", fileId: "f1" }));

    const result = await uploadToImageKit(file, "/resources/user-1");

    expect(result.url).toBe("https://ik.imagekit.io/x/notes.pdf");
    expect(fetch).toHaveBeenNthCalledWith(1, "/api/imagekit-auth", { cache: "no-store" });

    const [uploadUrl, options] = fetch.mock.calls[1];
    expect(uploadUrl).toBe("https://upload.imagekit.io/api/v1/files/upload");
    const body = options.body;
    expect(body.get("signature")).toBe("sig");
    expect(body.get("token")).toBe("tok");
    expect(body.get("publicKey")).toBe("pub");
    expect(body.get("folder")).toBe("/resources/user-1");
    expect(body.get("fileName")).toBe("notes.pdf");
  });

  it("asks the user to log in again when the signing route says 401", async () => {
    fetch.mockReturnValueOnce(json({ error: "Not signed in" }, 401));
    await expect(uploadToImageKit(file, "/x")).rejects.toThrow(/log in again/i);
    expect(fetch).toHaveBeenCalledTimes(1); // never tried to upload
  });

  it("surfaces ImageKit's error message when the upload is rejected", async () => {
    fetch
      .mockReturnValueOnce(
        json({ token: "t", expire: 1, signature: "s", publicKey: "p" })
      )
      .mockReturnValueOnce(json({ message: "File too large" }, 400));

    await expect(uploadToImageKit(file, "/x")).rejects.toThrow("File too large");
  });
});
