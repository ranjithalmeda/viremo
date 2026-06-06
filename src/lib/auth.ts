import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { getAuthUserByEmail } from "@/src/lib/auth-users";
import { verifyPassword } from "@/src/lib/password";
import { prisma } from "@/src/lib/prisma";
import { createUserWithUniqueUsername } from "@/src/lib/users";

const githubId = process.env.GITHUB_ID;
const githubSecret = process.env.GITHUB_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

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

        if (user.isBanned) {
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
          role: user.role,
          isBanned: user.isBanned,
        };
      },
    }),
    ...(githubId && githubSecret
      ? [
          GitHubProvider({
            clientId: githubId,
            clientSecret: githubSecret,
          }),
        ]
      : []),
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.id) {
        return true;
      }

      const record = await prisma.user.findUnique({
        where: { id: user.id },
        select: { isBanned: true },
      });

      return !record?.isBanned;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.publicId = user.publicId ?? null;
        token.username = user.username ?? null;
        token.role = user.role ?? "USER";
        token.isBanned = Boolean(user.isBanned);
      }

      if (token.sub) {
        const record = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            name: true,
            email: true,
            publicId: true,
            username: true,
            role: true,
            isBanned: true,
          },
        });

        if (record) {
          token.name = record.name;
          token.email = record.email;
          token.publicId = record.publicId;
          token.username = record.username;
          token.role = record.role;
          token.isBanned = record.isBanned;
        }
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
        session.user.role =
          token.role === "ADMIN" || token.role === "PRO" ? token.role : "USER";
        session.user.isBanned = Boolean(token.isBanned);
      }

      return session;
    },
  },
} satisfies NextAuthOptions;
