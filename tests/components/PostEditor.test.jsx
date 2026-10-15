import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/lib/supabase/useUser", () => ({
  useUser: () => ({ user: { id: "user-1" }, loading: false }),
}));

const insert = vi.fn();
const update = vi.fn();
const eq = vi.fn();
const del = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      insert: (...a) => insert(...a),
      update: (...a) => {
        update(...a);
        return { eq: (...b) => eq(...b) };
      },
      delete: () => ({ eq: (...b) => del(...b) }),
    }),
  }),
}));

const uploadToImageKit = vi.fn();
vi.mock("@/lib/imagekit", () => ({ uploadToImageKit: (...a) => uploadToImageKit(...a) }));

import toast from "react-hot-toast";
import PostEditor from "@/app/blog/PostEditor";

const png = (name = "cover.png") => new File(["x"], name, { type: "image/png" });

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
  insert.mockResolvedValue({ error: null });
  eq.mockResolvedValue({ error: null });
  del.mockResolvedValue({ error: null });
  uploadToImageKit.mockResolvedValue({ url: "https://ik.imagekit.io/uploaded.png" });
});

async function fillText(user, { title = "My Post", subtitle = "About things", content = "Hello readers" } = {}) {
  await user.type(screen.getByLabelText("Title"), title);
  await user.type(screen.getByLabelText("Subtitle"), subtitle);
  await user.type(screen.getByLabelText("Content"), content);
}

describe("PostEditor (new post)", () => {
  it("requires a cover image", async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    await fillText(user);
    await user.click(screen.getByRole("button", { name: /save draft/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/cover image is required/i);
    expect(insert).not.toHaveBeenCalled();
  });

  it.each([
    ["title", { title: "" }, /add a title/i],
    ["subtitle", { subtitle: "" }, /add a subtitle/i],
    ["content", { content: "" }, /write something/i],
  ])("requires a %s", async (_name, overrides, message) => {
    const user = userEvent.setup();
    render(<PostEditor />);

    await user.upload(screen.getByLabelText("Cover image"), png());
    const values = { title: "T", subtitle: "S", content: "C", ...overrides };
    for (const [key, label] of [["title", "Title"], ["subtitle", "Subtitle"], ["content", "Content"]]) {
      if (values[key]) await user.type(screen.getByLabelText(label), values[key]);
    }
    await user.click(screen.getByRole("button", { name: /save draft/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects a cover that is not an image", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<PostEditor />);

    await user.upload(
      screen.getByLabelText("Cover image"),
      new File(["x"], "notes.pdf", { type: "application/pdf" })
    );

    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/JPG, PNG, WebP or GIF/));
    expect(screen.queryByAltText("Cover preview")).toBeNull();
  });

  it("uploads the cover, then saves the post as a draft by the signed-in author", async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    await user.upload(screen.getByLabelText("Cover image"), png());
    expect(screen.getByAltText("Cover preview")).toBeInTheDocument();
    await fillText(user, { title: "Welcome Week", subtitle: "What to expect", content: "Para one" });
    await user.click(screen.getByRole("button", { name: /save draft/i }));

    await waitFor(() => expect(insert).toHaveBeenCalled());
    expect(uploadToImageKit).toHaveBeenCalledWith(expect.any(File), "/blog/user-1");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Welcome Week",
        subtitle: "What to expect",
        content: "Para one",
        cover_image_url: "https://ik.imagekit.io/uploaded.png",
        published: false,
        author_id: "user-1",
        slug: expect.stringMatching(/^welcome-week-[a-z0-9]+$/),
      })
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/blog\/welcome-week-/)));
  });

  it("publishes when the box is ticked", async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    await user.upload(screen.getByLabelText("Cover image"), png());
    await fillText(user);
    await user.click(screen.getByRole("checkbox", { name: /publish this post/i }));
    await user.click(screen.getByRole("button", { name: /publish post/i }));

    await waitFor(() => expect(insert).toHaveBeenCalledWith(expect.objectContaining({ published: true })));
  });

  it("shows the database error and stays on the page", async () => {
    insert.mockResolvedValue({ error: { message: "new row violates row-level security policy" } });
    const user = userEvent.setup();
    render(<PostEditor />);

    await user.upload(screen.getByLabelText("Cover image"), png());
    await fillText(user);
    await user.click(screen.getByRole("button", { name: /save draft/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/row-level security/i);
    expect(push).not.toHaveBeenCalled();
  });

  it("uploads an inline image and inserts it into the text", async () => {
    uploadToImageKit.mockResolvedValue({ url: "https://ik.imagekit.io/inline.png" });
    const user = userEvent.setup();
    render(<PostEditor />);

    await user.type(screen.getByLabelText("Content"), "Intro");
    await user.upload(screen.getByLabelText("Add image to content"), png("campus-photo.png"));

    await waitFor(() =>
      expect(screen.getByLabelText("Content")).toHaveValue(
        "Intro\n\n![campus photo](https://ik.imagekit.io/inline.png)"
      )
    );
  });

  it("applies toolbar formatting", async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(screen.getByLabelText("Content")).toHaveValue("**bold text**");
  });

  it("previews the formatted post", async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    await user.type(screen.getByLabelText("Content"), "## Hello{enter}{enter}A paragraph");
    await user.click(screen.getByRole("tab", { name: /preview/i }));

    expect(screen.getByRole("heading", { level: 2, name: "Hello" })).toBeInTheDocument();
    expect(screen.getByText("A paragraph")).toBeInTheDocument();
  });
});

describe("PostEditor (editing)", () => {
  const post = {
    id: "p1",
    slug: "existing-post-abc12",
    title: "Existing",
    subtitle: "Sub",
    content: "Body",
    cover_image_url: "https://ik.imagekit.io/old-cover.png",
    published: true,
  };

  it("loads the post and keeps the current cover when none is chosen", async () => {
    const user = userEvent.setup();
    render(<PostEditor post={post} />);

    expect(screen.getByLabelText("Title")).toHaveValue("Existing");
    await user.type(screen.getByLabelText("Title"), " v2");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(update).toHaveBeenCalled());
    expect(uploadToImageKit).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Existing v2",
        cover_image_url: "https://ik.imagekit.io/old-cover.png",
        published: true,
      })
    );
    expect(eq).toHaveBeenCalledWith("id", "p1");
    expect(insert).not.toHaveBeenCalled();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/blog/existing-post-abc12"));
  });

  it("deletes only after confirmation", async () => {
    const user = userEvent.setup();
    render(<PostEditor post={post} />);

    vi.spyOn(window, "confirm").mockReturnValueOnce(false);
    await user.click(screen.getByRole("button", { name: /delete post/i }));
    expect(del).not.toHaveBeenCalled();

    vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: /delete post/i }));
    await waitFor(() => expect(del).toHaveBeenCalledWith("id", "p1"));
    expect(push).toHaveBeenCalledWith("/blog");
  });
});
