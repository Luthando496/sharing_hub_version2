import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/image", () => ({
  default: ({ priority, ...props }) => <img {...props} />, // eslint-disable-line
}));
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

const signInWithPassword = vi.fn();
const signInWithOAuth = vi.fn();
const signUp = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signInWithPassword, signInWithOAuth, signUp } }),
}));
vi.mock("@/lib/supabase/useUser", () => ({
  useUser: () => ({ user: null, loading: false }),
}));

import toast from "react-hot-toast";
import LoginPage from "@/app/login/page";
import SignupPage from "@/app/signup/page";

describe("Login page", () => {
  it("signs in with email and password, then goes to /resources", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "ada@school.edu");
    await user.type(screen.getByLabelText("Password"), "secret12");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "ada@school.edu",
      password: "secret12",
    });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/resources"));
  });

  it("shows the error and stays on the page when credentials are wrong", async () => {
    signInWithPassword.mockResolvedValue({ error: { message: "Invalid login credentials" } });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "ada@school.edu");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Invalid login credentials"));
    expect(push).not.toHaveBeenCalled();
  });

  it.each(["google", "github"])("starts %s sign-in with the callback url", async (provider) => {
    signInWithOAuth.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: new RegExp(provider, "i") }));

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  });

  it("can show and hide the password", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    const field = screen.getByLabelText("Password");
    expect(field).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(field).toHaveAttribute("type", "text");
  });
});

describe("Signup page", () => {
  const fill = async (user, { password = "secret12" } = {}) => {
    await user.type(screen.getByLabelText("First name"), "Ada");
    await user.type(screen.getByLabelText("Last name"), "Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@school.edu");
    await user.type(screen.getByLabelText("Password"), password);
  };

  it("creates the account with name metadata and goes to /resources", async () => {
    signUp.mockResolvedValue({ data: { session: { access_token: "x" } }, error: null });
    const user = userEvent.setup();
    render(<SignupPage />);

    await fill(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@school.edu",
        password: "secret12",
        options: expect.objectContaining({
          data: { first_name: "Ada", last_name: "Lovelace" },
        }),
      })
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith("/resources"));
  });

  it("asks the user to confirm their email when no session is returned", async () => {
    signUp.mockResolvedValue({ data: { session: null }, error: null });
    const user = userEvent.setup();
    render(<SignupPage />);

    await fill(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/login"));
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringMatching(/confirm your account/i),
      expect.anything()
    );
  });

  it("rejects a short password before calling Supabase", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await fill(user, { password: "123" });
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(toast.error).toHaveBeenCalled();
    expect(signUp).not.toHaveBeenCalled();
  });

  it("shows Supabase's error message", async () => {
    signUp.mockResolvedValue({ data: {}, error: { message: "User already registered" } });
    const user = userEvent.setup();
    render(<SignupPage />);

    await fill(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("User already registered"));
    expect(push).not.toHaveBeenCalled();
  });
});
