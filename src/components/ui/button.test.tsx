import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("デフォルトで button 要素としてレンダリングされる", () => {
    render(<Button>クリック</Button>);
    expect(screen.getByRole("button", { name: "クリック" })).toBeInTheDocument();
  });

  it("クリックイベントが発火する", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("disabled のとき、クリックイベントが発火しない", async () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        クリック
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("variant='outline' の data 属性が設定される", () => {
    render(<Button variant="outline">クリック</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "outline");
  });

  it("variant='ghost' の data 属性が設定される", () => {
    render(<Button variant="ghost">クリック</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "ghost");
  });

  it("size='lg' の data 属性が設定される", () => {
    render(<Button size="lg">クリック</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");
  });

  it("asChild のとき子要素のタグでレンダリングされる", () => {
    render(
      <Button asChild>
        <a href="/test">リンクボタン</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "リンクボタン" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("type='submit' が正しく渡される", () => {
    render(<Button type="submit">送信</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
