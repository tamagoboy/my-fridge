import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Node.js 環境（Vitest）で動作する MSW サーバー
export const server = setupServer(...handlers);
