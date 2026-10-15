import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "@/app/components/ThemeToggle";

describe("ThemeToggle", () => {
  it("shows the currently active theme as pressed", async () => {
    document.documentElement.dataset.theme = "dark";
    render(<ThemeToggle />);

    expect(await screen.findByRole("button", { name: /dark theme/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: /vibrant theme/i })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("switches the page theme and remembers the choice", async () => {
    document.documentElement.dataset.theme = "vibrant";
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: /dark theme/i }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    await user.click(screen.getByRole("button", { name: /vibrant theme/i }));

    expect(document.documentElement.dataset.theme).toBe("vibrant");
    expect(localStorage.getItem("theme")).toBe("vibrant");
  });
});
