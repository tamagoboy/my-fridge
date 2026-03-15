import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "@/mocks/server";

// 全テスト開始前に MSW サーバーを起動
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// 各テスト後にハンドラーをリセット（テスト間の干渉を防ぐ）
afterEach(() => server.resetHandlers());

// 全テスト終了後にサーバーを停止
afterAll(() => server.close());
