import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const fetchAllPosts = vi.fn();
vi.mock("@/actions/resources", () => ({ fetchAllPosts: (...a) => fetchAllPosts(...a) }));
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import toast from "react-hot-toast";
import ResourcesPage from "@/app/resources/page";

const post = (over) => ({
  id: "1",
  title: "Calculus cheat sheet",
  description: "Limits and derivatives",
  category: "Mathematics",
  type: "Notes",
  uploadDate: "2026-01-01T00:00:00Z",
  downloads: 5,
  image: "",
  fileName: "calc.pdf",
  fileURL: "https://ik.imagekit.io/calc.pdf",
  authorId: "u1",
  ...over,
});

const POSTS = [
  post(),
  post({ id: "2", title: "Python basics", description: "Loops and lists", category: "Computer Science", type: "Study Guide", downloads: 50, fileURL: "" }),
  post({ id: "3", title: "WW2 timeline", description: "Key dates", category: "History", type: "Notes", downloads: 20 }),
];

beforeEach(() => {
  fetchAllPosts.mockResolvedValue(POSTS);
  window.history.pushState({}, "", "/resources");
});

async function loaded() {
  render(<ResourcesPage />);
  await screen.findByText("Python basics");
}

describe("Resources page", () => {
  it("lists resources, most popular first", async () => {
    await loaded();
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Python basics", "WW2 timeline", "Calculus cheat sheet"]);
    expect(screen.getByText(/resources found/i)).toHaveTextContent("3 resources found");
  });

  it("filters by search text", async () => {
    await loaded();
    await userEvent.type(screen.getByLabelText(/search resources/i), "timeline");

    expect(screen.getByText("WW2 timeline")).toBeInTheDocument();
    expect(screen.queryByText("Python basics")).toBeNull();
    expect(screen.getByText(/resources? found/i)).toHaveTextContent("1 resource found");
  });

  it("filters by subject chip", async () => {
    await loaded();
    await userEvent.click(screen.getByRole("button", { name: "History" }));

    expect(screen.getByText("WW2 timeline")).toBeInTheDocument();
    expect(screen.queryByText("Calculus cheat sheet")).toBeNull();
    expect(screen.getByRole("button", { name: "History" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows an empty state when nothing matches", async () => {
    await loaded();
    await userEvent.type(screen.getByLabelText(/search resources/i), "zzzzzz");
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("preselects the subject from ?category=", async () => {
    window.history.pushState({}, "", "/resources?category=Chemistry");
    render(<ResourcesPage />);
    await screen.findByText("Nothing here yet"); // no Chemistry posts in the fixtures
    expect(screen.getByRole("button", { name: "Chemistry" })).toHaveAttribute("aria-pressed", "true");
  });

  it("counts a download and starts it", async () => {
    await loaded();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    // WW2 timeline is second in the list and has a file
    await userEvent.click(screen.getAllByRole("button", { name: /download/i })[1]);

    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/increment-download",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ postId: "3" }) })
    );
    expect(screen.getByText("21")).toBeInTheDocument(); // 20 -> 21
  });

  it("tells the user when a resource has no file", async () => {
    await loaded();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    // Python basics is first and has no fileURL
    await userEvent.click(screen.getAllByRole("button", { name: /download/i })[0]);

    expect(toast.error).toHaveBeenCalledWith("Download URL not available");
    expect(click).not.toHaveBeenCalled();
  });
});
