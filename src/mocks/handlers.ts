import { http, HttpResponse } from "msw";

// NextAuth の基本エンドポイントに対するデフォルトハンドラー
export const handlers = [
  http.get("/api/auth/session", () => {
    return HttpResponse.json({
      user: null,
      expires: new Date(Date.now() + 86400000).toISOString(),
    });
  }),

  http.post("/api/auth/csrf", () => {
    return HttpResponse.json({ csrfToken: "test-csrf-token" });
  }),
];
