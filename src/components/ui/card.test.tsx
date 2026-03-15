import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

describe("Card コンポーネント群", () => {
  it("Card がレンダリングされる", () => {
    render(<Card data-testid="card">内容</Card>);
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("Card に data-slot='card' 属性が付与される", () => {
    render(<Card data-testid="card" />);
    expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "card");
  });

  it("CardHeader / CardTitle / CardContent の組み合わせが正しくレンダリングされる", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>タイトル</CardTitle>
        </CardHeader>
        <CardContent>コンテンツ</CardContent>
      </Card>,
    );
    expect(screen.getByText("タイトル")).toBeInTheDocument();
    expect(screen.getByText("コンテンツ")).toBeInTheDocument();
  });

  it("CardDescription がレンダリングされる", () => {
    render(<CardDescription>説明文</CardDescription>);
    expect(screen.getByText("説明文")).toBeInTheDocument();
  });

  it("CardFooter がレンダリングされる", () => {
    render(<CardFooter data-testid="footer">フッター</CardFooter>);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toHaveAttribute("data-slot", "card-footer");
  });

  it("CardAction がレンダリングされる", () => {
    render(<CardAction data-testid="action">アクション</CardAction>);
    expect(screen.getByTestId("action")).toBeInTheDocument();
    expect(screen.getByTestId("action")).toHaveAttribute("data-slot", "card-action");
  });

  it("追加の className が適用される", () => {
    render(<Card data-testid="card" className="custom-class" />);
    expect(screen.getByTestId("card")).toHaveClass("custom-class");
  });
});
