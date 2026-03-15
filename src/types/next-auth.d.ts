import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      fridgeId: string;
      id: string;
    };
  }

  interface User {
    fridgeId: string;
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    fridgeId?: string;
    userId?: string;
  }
}

export {};