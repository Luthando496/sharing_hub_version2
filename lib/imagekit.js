// Browser-side upload to ImageKit. The server (app/api/imagekit-auth) signs the
// request for signed-in users only, so the private key never reaches the browser.
export async function uploadToImageKit(file, folder) {
  const authRes = await fetch("/api/imagekit-auth", { cache: "no-store" });
  if (!authRes.ok) {
    throw new Error(
      authRes.status === 401
        ? "Please log in again to upload."
        : "Couldn't start the upload. Please try again."
    );
  }
  const { token, expire, signature, publicKey } = await authRes.json();

  const body = new FormData();
  body.append("file", file);
  body.append("fileName", file.name);
  body.append("publicKey", publicKey);
  body.append("signature", signature);
  body.append("expire", String(expire));
  body.append("token", token);
  body.append("folder", folder);
  body.append("useUniqueFileName", "true");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "Upload to storage failed.");
  }
  return json; // { url, fileId, name, ... }
}
