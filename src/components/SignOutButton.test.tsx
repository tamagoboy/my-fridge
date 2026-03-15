import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signOut } from "next-auth/react";
import { describe, expect, it, vi } from "vitest";
import { SignOutButton } from "./SignOutButton";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

describe("SignOutButton", () => {
  it("「ログアウト」ボタンが表示される", () => {
    render(<SignOutButton />);
    expect(screen.getByRole("button", { name: "ログアウト" })).toBeInTheDocument();
  });

  it("クリックで signOut が callbackUrl: '/login' で呼ばれる", async () => {
    vi.mocked(signOut).mockResolvedValueOnce(undefined as never);
    render(<SignOutButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("outline variant で表示される", () => {
    render(<SignOutButton />);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "outline");
  });

  it("初期状態でボタンが有効（disabled でない）", () => {
    render(<SignOutButton />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("signOut が呼ばれるとボタンが disabled になる", async () => {
    vi.mocked(signOut).mockReturnValueOnce(new Promise(() => {}) as never);
    render(<SignOutButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
