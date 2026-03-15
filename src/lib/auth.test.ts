import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock はファイル先頭にホイストされるため、参照する変数は vi.hoisted() で定義する
const mockPrismaClient = vi.hoisted(() => ({
  $transaction: vi.fn(),
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  fridge: {
    create: vi.fn(),
  },
  fridgeMember: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrismaClient }));

// GoogleProvider はオブジェクトを返すだけでよい
vi.mock("next-auth/providers/google", () => ({
  default: vi.fn(() => ({ id: "google", type: "oauth" })),
}));

import { authOptions } from "./auth";

// ヘルパー: $transaction がコールバックに tx（= mockPrismaClient）を渡して実行するモック
function mockTransaction() {
  mockPrismaClient.$transaction.mockImplementationOnce(
    async (fn: (tx: typeof mockPrismaClient) => unknown) => fn(mockPrismaClient),
  );
}

describe("authOptions.callbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── jwt callback ────────────────────────────────────────────────────────────
  describe("jwt", () => {
    const jwt = authOptions.callbacks!.jwt!.bind(authOptions.callbacks);

    it("user が渡された初回ログイン時: token に userId / fridgeId をセットする", async () => {
      const token = { email: "test@example.com" };
      const user = { id: "user-1", fridgeId: "fridge-1", email: "test@example.com" };

      const result = await jwt({ token, user, account: null } as never);

      expect(result.userId).toBe("user-1");
      expect(result.fridgeId).toBe("fridge-1");
    });

    it("token に既に userId / fridgeId がある場合: そのまま返す（DB アクセスなし）", async () => {
      const token = { userId: "user-1", fridgeId: "fridge-1", email: "test@example.com" };

      const result = await jwt({ token, user: undefined as never, account: null } as never);

      expect(result.userId).toBe("user-1");
      expect(result.fridgeId).toBe("fridge-1");
      expect(mockPrismaClient.user.findUnique).not.toHaveBeenCalled();
    });

    it("token に email がない場合: token をそのまま返す", async () => {
      const token = {};

      const result = await jwt({ token, user: undefined as never, account: null } as never);

      expect(result).toEqual({});
      expect(mockPrismaClient.user.findUnique).not.toHaveBeenCalled();
    });

    it("DB にユーザーがいて fridgeMember もある場合: userId / fridgeId をセットする", async () => {
      const token = { email: "test@example.com" };
      mockPrismaClient.user.findUnique.mockResolvedValueOnce({
        id: "user-db",
        fridgeMember: { fridgeId: "fridge-db" },
      });

      const result = await jwt({ token, user: undefined as never, account: null } as never);

      expect(result.userId).toBe("user-db");
      expect(result.fridgeId).toBe("fridge-db");
    });

    it("DB ユーザーに fridgeMember がない場合: userId / fridgeId は undefined のまま", async () => {
      const token = { email: "test@example.com" };
      mockPrismaClient.user.findUnique.mockResolvedValueOnce({
        id: "user-db",
        fridgeMember: null,
      });

      const result = await jwt({ token, user: undefined as never, account: null } as never);

      expect(result.userId).toBeUndefined();
      expect(result.fridgeId).toBeUndefined();
    });
  });

  // ─── session callback ────────────────────────────────────────────────────────
  describe("session", () => {
    const session = authOptions.callbacks!.session!.bind(authOptions.callbacks);

    it("token に userId / fridgeId がある場合: session.user に反映する", async () => {
      const s = { user: { name: "Test", email: "test@example.com" }, expires: "" };
      const token = { userId: "user-1", fridgeId: "fridge-1" };

      const result = await session({ session: s, token } as never);
      const user = result.user as Record<string, unknown>;

      expect(user.id).toBe("user-1");
      expect(user.fridgeId).toBe("fridge-1");
    });

    it("token に userId / fridgeId がない場合: session をそのまま返す", async () => {
      const s = { user: { name: "Test", email: "test@example.com" }, expires: "" };
      const token = {};

      const result = await session({ session: s, token } as never);
      const user = result.user as Record<string, unknown>;

      expect(user.id).toBeUndefined();
    });
  });

  // ─── signIn callback ─────────────────────────────────────────────────────────
  describe("signIn", () => {
    const signIn = authOptions.callbacks!.signIn!.bind(authOptions.callbacks);

    it("Google 以外のプロバイダーの場合: false を返す", async () => {
      const result = await signIn({
        account: { provider: "github", providerAccountId: "123", type: "oauth" },
        user: { email: "test@example.com" },
      } as never);

      expect(result).toBe(false);
    });

    it("providerAccountId が空の場合: false を返す", async () => {
      const result = await signIn({
        account: { provider: "google", providerAccountId: "", type: "oauth" },
        user: { email: "test@example.com" },
      } as never);

      expect(result).toBe(false);
    });

    it("email が空の場合: false を返す", async () => {
      const result = await signIn({
        account: { provider: "google", providerAccountId: "google-123", type: "oauth" },
        user: { email: "" },
      } as never);

      expect(result).toBe(false);
    });

    it("正常な Google 認証: true を返し user.id / user.fridgeId をセットする", async () => {
      const user: Record<string, unknown> = {
        email: "test@example.com",
        name: "Test User",
        image: null,
      };

      // $transaction がコールバックを実行し、既存ユーザー（fridgeMember あり）を返す
      mockPrismaClient.$transaction.mockImplementationOnce(
        async (fn: (tx: typeof mockPrismaClient) => unknown) => {
          const tx = {
            user: {
              findUnique: vi
                .fn()
                // 1回目: googleId で検索
                .mockResolvedValueOnce({
                  id: "user-1",
                  fridgeMember: { fridgeId: "fridge-1" },
                }),
              update: vi.fn(),
              create: vi.fn(),
            },
            fridge: { create: vi.fn() },
            fridgeMember: { create: vi.fn() },
          };
          return fn(tx as never);
        },
      );

      const result = await signIn({
        account: { provider: "google", providerAccountId: "google-abc", type: "oauth" },
        user,
      } as never);

      expect(result).toBe(true);
      expect(user.id).toBe("user-1");
      expect(user.fridgeId).toBe("fridge-1");
    });

    it("新規ユーザーの場合: fridge と fridgeMember が作成される", async () => {
      const user: Record<string, unknown> = {
        email: "new@example.com",
        name: "New User",
        image: null,
      };

      mockPrismaClient.$transaction.mockImplementationOnce(
        async (fn: (tx: typeof mockPrismaClient) => unknown) => {
          const tx = {
            user: {
              findUnique: vi.fn().mockResolvedValue(null), // 既存ユーザーなし
              update: vi.fn(),
              create: vi.fn().mockResolvedValueOnce({ id: "new-user-1" }),
            },
            fridge: {
              create: vi.fn().mockResolvedValueOnce({ id: "new-fridge-1" }),
            },
            fridgeMember: { create: vi.fn() },
          };
          return fn(tx as never);
        },
      );

      const result = await signIn({
        account: { provider: "google", providerAccountId: "google-new", type: "oauth" },
        user,
      } as never);

      expect(result).toBe(true);
      expect(user.id).toBe("new-user-1");
      expect(user.fridgeId).toBe("new-fridge-1");
    });

    it("Prisma がエラーを投げた場合: false を返す", async () => {
      mockPrismaClient.$transaction.mockRejectedValueOnce(new Error("DB connection error"));

      const result = await signIn({
        account: { provider: "google", providerAccountId: "google-abc", type: "oauth" },
        user: { email: "test@example.com" },
      } as never);

      expect(result).toBe(false);
    });
  });
});
