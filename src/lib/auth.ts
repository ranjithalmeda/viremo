import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";

import { getAuthUserByEmail } from "@/src/lib/auth-users";
import { verifyPassword } from "@/src/lib/password";
import { prisma } from "@/src/lib/prisma";
import { createUserWithUniqueUsername } from "@/src/lib/users";

const fallbackGitHubId = process.env.GITHUB_ID || "missing-github-id";
const fallbackGitHubSecret =
  process.env.GITHUB_SECRET || "missing-github-secret";

const baseAdapter = PrismaAdapter(prisma);
const adapter: Adapter = {
  ...baseAdapter,
  createUser: async (data: Omit<AdapterUser, "id">) => {
    const user = await createUserWithUniqueUsername({
      email: data.email,
      name: data.name,
      image: data.image,
      emailVerified: data.emailVerified,
    });

    return {
      ...user,
      email: user.email ?? data.email,
    };
  },
};

export const authOptions = {
  adapter,
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";

        if (!email || !password) {
          return null;
        }

        const user = await getAuthUserByEmail(email);

        if (!user?.passwordHash) {
          return null;
        }

        const validPassword = await verifyPassword(password, user.passwordHash);
        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email ?? email,
          name: user.name,
          image: user.image,
          publicId: user.publicId,
          username: user.username,
        };
      },
    }),
    GitHubProvider({
      clientId: fallbackGitHubId,
      clientSecret: fallbackGitHubSecret,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.publicId = user.publicId ?? null;
        token.username = user.username ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.publicId =
          typeof token.publicId === "string" ? token.publicId : null;
        session.user.username =
          typeof token.username === "string" ? token.username : null;
      }

      return session;
    },
  },
} satisfies NextAuthOptions;
