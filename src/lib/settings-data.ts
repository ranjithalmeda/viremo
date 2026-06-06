import { Prisma } from "@prisma/client";

import { hashPassword, verifyPassword } from "@/src/lib/password";
import { pgPool } from "@/src/lib/postgres";
import { prisma } from "@/src/lib/prisma";

export type SettingsProfile = {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  email: string | null;
  hasPassword: boolean;
};

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function isValidUsername(username: string) {
  return /^[a-z0-9_]{3,24}$/.test(username);
}

function mapSettingsProfile(row: Record<string, unknown>): SettingsProfile {
  return {
    id: String(row.id),
    name: row.name === null ? null : String(row.name),
    username: row.username === null ? null : String(row.username),
    bio: row.bio === null ? null : String(row.bio),
    email: row.email === null ? null : String(row.email),
    hasPassword: Boolean(row.hasPassword),
  };
}

export async function getSettingsProfile(userId: string) {
  const result = await pgPool.query(
    `SELECT id, name, username, bio, email, ("passwordHash" IS NOT NULL) AS "hasPassword"
     FROM "User"
     WHERE id = $1
     LIMIT 1`,
    [userId],
  );

  return result.rows[0] ? mapSettingsProfile(result.rows[0]) : null;
}

export async function updateSettingsProfile(
  userId: string,
  input: {
    name: string | null;
    username: string;
    bio: string | null;
    email: string;
  },
) {
  try {
    const result = await pgPool.query(
      `UPDATE "User"
       SET name = $1, username = $2, bio = $3, email = $4
       WHERE id = $5
       RETURNING id, name, username, bio, email, ("passwordHash" IS NOT NULL) AS "hasPassword"`,
      [input.name, input.username, input.bio, input.email, userId],
    );

    return result.rows[0] ? mapSettingsProfile(result.rows[0]) : null;
  } catch (error) {
    const maybeCode =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : undefined;
    const maybeConstraint =
      error && typeof error === "object" && "constraint" in error
        ? String(error.constraint)
        : "";

    if (maybeCode === "23505" && maybeConstraint.includes("username")) {
      throw new Error("Username is already taken.");
    }

    if (maybeCode === "23505" && maybeConstraint.includes("email")) {
      throw new Error("Email is already taken.");
    }

    throw error;
  }
}

export async function changeCredentialPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    throw new Error("Password changes are only available for email/password accounts.");
  }

  const validPassword = await verifyPassword(currentPassword, user.passwordHash);

  if (!validPassword) {
    throw new Error("Current password is incorrect.");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function deleteAccountForUser(
  userId: string,
  confirmation: {
    password?: string;
    confirmText?: string;
  },
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    throw new Error("Account not found.");
  }

  if (user.passwordHash) {
    const password = confirmation.password || "";
    const validPassword = await verifyPassword(password, user.passwordHash);

    if (!validPassword) {
      throw new Error("Password confirmation is incorrect.");
    }
  } else if (confirmation.confirmText !== "DELETE") {
    throw new Error("Type DELETE to confirm account deletion.");
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new Error("Account not found.");
    }

    throw error;
  }
}
