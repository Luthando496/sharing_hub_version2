import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Thumb from "@/app/components/Thumb";

describe("Thumb", () => {
  it("shows the image when there is a url", () => {
    render(<Thumb src="https://ik.imagekit.io/a.png" alt="Calculus" />);
    expect(screen.getByRole("img", { name: "Calculus" })).toHaveAttribute(
      "src",
      "https://ik.imagekit.io/a.png"
    );
  });

  it("shows a placeholder when there is no url", () => {
    const { container } = render(<Thumb src="" alt="Calculus" />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Calculus" })).toBeInTheDocument();
  });

  it("swaps to the placeholder when the image fails to load", () => {
    const { container } = render(<Thumb src="https://broken.example/x.png" alt="Calculus" />);
    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Calculus" })).toBeInTheDocument();
  });
});
