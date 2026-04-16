import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is not set.");
}

const globalForPg = globalThis as typeof globalThis & {
  watchDiaryPool?: Pool;
};

export const pgPool =
  globalForPg.watchDiaryPool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.watchDiaryPool = pgPool;
}
