import { randomUUID } from "node:crypto";

import { pgPool } from "@/src/lib/postgres";
import { createPublicId } from "@/src/lib/public-id";

export type AuthUserRecord = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  publicId: string;
  username: string | null;
  passwordHash: string | null;
};

function createBaseUsername(email?: string | null, name?: string | null) {
  const source = email?.split("@")[0] || name || "watcher";
  const username = source.toLowerCase().replace(/[^a-z0-9]/g, "");
  return username || "watcher";
}

function mapAuthUser(row: Record<string, unknown>): AuthUserRecord {
  return {
    id: String(row.id),
    email: row.email === null ? null : String(row.email),
    name: row.name === null ? null : String(row.name),
    image: row.image === null ? null : String(row.image),
    publicId: String(row.publicId),
    username: row.username === null ? null : String(row.username),
    passwordHash:
      row.passwordHash === null ? null : String(row.passwordHash),
  };
}

export async function getAuthUserByEmail(email: string) {
  const result = await pgPool.query(
    `select id, email, name, image, "publicId", username, "passwordHash"
     from "User"
     where email = $1
     limit 1`,
    [email],
  );

  if (!result.rows.length) {
    return null;
  }

  return mapAuthUser(result.rows[0]);
}

export async function createCredentialUser(input: {
  email: string;
  name?: string | null;
  passwordHash: string;
}) {
  const base = createBaseUsername(input.email, input.name);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix =
      attempt === 0
        ? ""
        : attempt === 19
          ? randomUUID().slice(0, 8)
          : `${attempt + 1}`;
    const username = `${base}${suffix}`;

    try {
      const result = await pgPool.query(
        `insert into "User" ("id", "email", "name", "image", "emailVerified", "passwordHash", "publicId", "username", "createdAt")
         values ($1, $2, $3, $4, $5, $6, $7, $8, now())
         returning id, email, name, image, "publicId", username, "passwordHash"`,
        [
          randomUUID().replace(/-/g, "").slice(0, 25),
          input.email,
          input.name ?? null,
          null,
          null,
          input.passwordHash,
          createPublicId(),
          username,
        ],
      );

      return mapAuthUser(result.rows[0]);
    } catch (error) {
      const maybeCode =
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : undefined;
      const maybeConstraint =
        error && typeof error === "object" && "constraint" in error
          ? String(error.constraint)
          : "";

      const isUniqueConflict =
        maybeCode === "23505" &&
        (maybeConstraint.includes("username") ||
          maybeConstraint.includes("publicId"));

      if (!isUniqueConflict) {
        throw error;
      }
    }
  }

  throw new Error("Unable to create a unique public profile identifier.");
}
