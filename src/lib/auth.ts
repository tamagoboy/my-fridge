import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

type EnsureUserParams = {
  email: string;
  googleId: string;
  name?: string | null;
  image?: string | null;
};

async function ensureUserAndFridgeMember({
  email,
  googleId,
  name,
  image,
}: EnsureUserParams) {
  return prisma.$transaction(async (transaction) => {
    const userByGoogleId = await transaction.user.findUnique({
      where: { googleId },
      select: {
        id: true,
        fridgeMember: {
          select: { fridgeId: true },
        },
      },
    });

    if (userByGoogleId) {
      await transaction.user.update({
        where: { googleId },
        data: {
          email,
          image,
          name,
        },
      });

      if (userByGoogleId.fridgeMember) {
        return {
          fridgeId: userByGoogleId.fridgeMember.fridgeId,
          userId: userByGoogleId.id,
        };
      }

      const fridge = await transaction.fridge.create({
        data: {},
        select: { id: true },
      });

      await transaction.fridgeMember.create({
        data: {
          fridgeId: fridge.id,
          userId: userByGoogleId.id,
        },
      });

      return {
        fridgeId: fridge.id,
        userId: userByGoogleId.id,
      };
    }

    const userByEmail = await transaction.user.findUnique({
      where: { email },
      select: {
        id: true,
        fridgeMember: {
          select: { fridgeId: true },
        },
      },
    });

    if (userByEmail) {
      await transaction.user.update({
        where: { email },
        data: {
          googleId,
          image,
          name,
        },
      });

      if (userByEmail.fridgeMember) {
        return {
          fridgeId: userByEmail.fridgeMember.fridgeId,
          userId: userByEmail.id,
        };
      }

      const fridge = await transaction.fridge.create({
        data: {},
        select: { id: true },
      });

      await transaction.fridgeMember.create({
        data: {
          fridgeId: fridge.id,
          userId: userByEmail.id,
        },
      });

      return {
        fridgeId: fridge.id,
        userId: userByEmail.id,
      };
    }

    const createdUser = await transaction.user.create({
      data: {
        email,
        googleId,
        image,
        name,
      },
      select: { id: true },
    });

    const fridge = await transaction.fridge.create({
      data: {},
      select: { id: true },
    });

    await transaction.fridgeMember.create({
      data: {
        fridgeId: fridge.id,
        userId: createdUser.id,
      },
    });

    return {
      fridgeId: fridge.id,
      userId: createdUser.id,
    };
  });
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
        return false;
      }
    },
  },
  pages: {
    signIn: "/login",
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