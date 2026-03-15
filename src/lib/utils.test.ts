import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("単一クラスをそのまま返す", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("複数クラスをスペース区切りでマージする", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("falsy な値（false / undefined / null）を無視する", () => {
    expect(cn("foo", false, undefined, null, "bar")).toBe("foo bar");
  });

  it("Tailwind の競合クラスは後勝ちでマージする", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("条件付きクラスオブジェクトを正しく適用する", () => {
    expect(cn("base", { active: true, inactive: false })).toBe("base active");
  });

  it("引数が空の場合、空文字を返す", () => {
    expect(cn()).toBe("");
  });

  it("配列形式のクラスを展開してマージする", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });
});
