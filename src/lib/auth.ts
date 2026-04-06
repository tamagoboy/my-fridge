import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

type EnsureUserParams = {
  email: string;
  googleId: string;
  name?: string | null;
  image?: string | null;
};

async function createFridgeForUser(userId: string) {
  const fridge = await prisma.fridge.create({
    data: {},
    select: { id: true },
  });

  await prisma.storageLocation.createMany({
    data: [
      { fridgeId: fridge.id, name: "冷蔵庫", sortOrder: 0 },
      { fridgeId: fridge.id, name: "冷凍庫", sortOrder: 1 },
      { fridgeId: fridge.id, name: "常温", sortOrder: 2 },
    ],
  });

  await prisma.fridgeMember.create({
    data: {
      fridgeId: fridge.id,
      userId,
    },
  });

  return fridge.id;
}

async function ensureUserAndFridgeMember({
  email,
  googleId,
  name,
  image,
}: EnsureUserParams) {
  // googleId でユーザーを検索
  const userByGoogleId = await prisma.user.findUnique({
    where: { googleId },
    select: {
      id: true,
      fridgeMember: {
        select: { fridgeId: true },
      },
    },
  });

  if (userByGoogleId) {
    await prisma.user.update({
      where: { googleId },
      data: { email, image, name },
    });

    if (userByGoogleId.fridgeMember) {
      return {
        fridgeId: userByGoogleId.fridgeMember.fridgeId,
        userId: userByGoogleId.id,
      };
    }

    const fridgeId = await createFridgeForUser(userByGoogleId.id);
    return { fridgeId, userId: userByGoogleId.id };
  }

  // email でユーザーを検索
  const userByEmail = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fridgeMember: {
        select: { fridgeId: true },
      },
    },
  });

  if (userByEmail) {
    await prisma.user.update({
      where: { email },
      data: { googleId, image, name },
    });

    if (userByEmail.fridgeMember) {
      return {
        fridgeId: userByEmail.fridgeMember.fridgeId,
        userId: userByEmail.id,
      };
    }

    const fridgeId = await createFridgeForUser(userByEmail.id);
    return { fridgeId, userId: userByEmail.id };
  }

  // 新規ユーザー作成
  const createdUser = await prisma.user.create({
    data: { email, googleId, image, name },
    select: { id: true },
  });

  const fridgeId = await createFridgeForUser(createdUser.id);
  return { fridgeId, userId: createdUser.id };
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.fridgeId = user.fridgeId;
        return token;
      }

      if (token.userId && token.fridgeId) {
        return token;
      }

      if (!token.email) {
        return token;
      }

      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
        select: {
          id: true,
          fridgeMember: {
            select: { fridgeId: true },
          },
        },
      });

      if (!dbUser?.fridgeMember) {
        return token;
      }

      token.userId = dbUser.id;
      token.fridgeId = dbUser.fridgeMember.fridgeId;

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId && token.fridgeId) {
        session.user.fridgeId = token.fridgeId;
        session.user.id = token.userId;
      }

      return session;
    },
    async signIn({ account, user }) {
      if (account?.provider !== "google" || !account.providerAccountId || !user.email) {
        return false;
      }

      try {
        const result = await ensureUserAndFridgeMember({
          email: user.email,
          googleId: account.providerAccountId,
          image: user.image,
          name: user.name,
        });

        user.id = result.userId;
        user.fridgeId = result.fridgeId;

        return true;
      } catch (error) {
        console.error("認証時のユーザー同期に失敗しました", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return `/login?error=SignInError&detail=${encodeURIComponent(message)}`;
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};