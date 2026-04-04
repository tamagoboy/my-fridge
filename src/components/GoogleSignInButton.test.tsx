import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import { describe, expect, it, vi } from "vitest";
import { GoogleSignInButton } from "./GoogleSignInButton";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

describe("GoogleSignInButton", () => {
  it("「Googleでサインイン」ボタンが表示される", () => {
    render(<GoogleSignInButton />);
    expect(
      screen.getByRole("button", { name: "Googleでサインイン" }),
    ).toBeInTheDocument();
  });

  it("クリックで signIn('google') が callbackUrl: '/dashboard' で呼ばれる", async () => {
    vi.mocked(signIn).mockResolvedValueOnce(undefined as never);
    render(<GoogleSignInButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/dashboard" });
  });

  it("初期状態でボタンが有効（disabled でない）", () => {
    render(<GoogleSignInButton />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("signIn が呼ばれるとボタンが disabled になる", async () => {
    // signIn を永遠に pending のままにする
    vi.mocked(signIn).mockReturnValueOnce(new Promise(() => {}) as never);
    render(<GoogleSignInButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
