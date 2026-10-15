import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

let mockUser = null;
vi.mock("@/lib/supabase/useUser", () => ({
  useUser: () => ({ user: mockUser, loading: false }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/resources",
}));

import Header from "@/app/components/Header";

describe("Header", () => {
  it("offers Log in to visitors", () => {
    mockUser = null;
    render(<Header />);
    expect(screen.getAllByRole("link", { name: "Log in" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
  });

  it("offers Profile to signed-in users", () => {
    mockUser = { id: "u1" };
    render(<Header />);
    expect(screen.getAllByRole("link", { name: "Profile" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
  });

  it("links to the main sections", () => {
    mockUser = null;
    render(<Header />);
    expect(screen.getAllByRole("link", { name: "Browse" })[0]).toHaveAttribute("href", "/resources");
    expect(screen.getAllByRole("link", { name: "Share" })[0]).toHaveAttribute("href", "/upload-resources");
    expect(screen.getAllByRole("link", { name: "About" })[0]).toHaveAttribute("href", "/about");
  });

  it("opens and closes the mobile menu", async () => {
    mockUser = null;
    const user = userEvent.setup();
    render(<Header />);

    const toggle = screen.getByRole("button", { name: /open menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(screen.getByRole("button", { name: /close menu/i })).toHaveAttribute(
      "aria-expanded",
      "true"
    );

    await user.click(screen.getByRole("button", { name: /close menu/i }));
    expect(screen.getByRole("button", { name: /open menu/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("includes the theme switcher", () => {
    render(<Header />);
    expect(screen.getByRole("group", { name: /color theme/i })).toBeInTheDocument();
  });
});
