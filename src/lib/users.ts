import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import { createPublicId } from "@/src/lib/public-id";
import { prisma } from "@/src/lib/prisma";

type CreateUserInput = {
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  passwordHash?: string | null;
};

export function createBaseUsername(email?: string | null, name?: string | null) {
  const source = email?.split("@")[0] || name || "watcher";
  const username = source.toLowerCase().replace(/[^a-z0-9]/g, "");
  return username || "watcher";
}

export async function createUserWithUniqueUsername(data: CreateUserInput) {
  const base = createBaseUsername(data.email, data.name);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix =
      attempt === 0
        ? ""
        : attempt === 19
          ? randomUUID().slice(0, 8)
          : `${attempt + 1}`;
    const username = `${base}${suffix}`;

    try {
      return await prisma.user.create({
        data: {
          ...data,
          publicId: createPublicId(),
          username,
        },
      });
    } catch (error) {
      const isUniqueConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        Array.isArray(error.meta?.target) &&
        (error.meta.target.includes("username") ||
          error.meta.target.includes("publicId"));

      if (!isUniqueConflict) {
        throw error;
      }
    }
  }

  throw new Error("Unable to create a unique public profile identifier.");
}
