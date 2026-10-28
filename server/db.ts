import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient, type InValue, type ResultSet, type Transaction } from "@libsql/client";
import { config } from "./config.ts";

const isLocalFile = config.databaseUrl.startsWith("file:");
if (isLocalFile) mkdirSync(dirname(resolve(config.databaseUrl.slice("file:".length))), { recursive: true });

// Turso hands out libsql:// URLs; plain HTTPS suits short-lived serverless functions best.
export const db = createClient({
  url: config.databaseUrl.replace(/^libsql:\/\//, "https://"),
  authToken: config.databaseAuthToken,
});

const schema = `
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE
  );

  CREATE TABLE IF NOT EXISTS venues (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE
  );

  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    leader_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS ix_groups_topic_id ON groups(topic_id);
  CREATE INDEX IF NOT EXISTS ix_groups_leader_id ON groups(leader_id);

  CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, student_id)
  );
  CREATE INDEX IF NOT EXISTS ix_group_members_student_id ON group_members(student_id);

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    slot TEXT NOT NULL,
    UNIQUE (venue_id, date, slot)
  );
  CREATE INDEX IF NOT EXISTS ix_bookings_group_id ON bookings(group_id);
`;

const defaultTopics = ["Computer Science", "English", "Science", "Maths"];

export interface Queries {
  one<T>(sql: string, ...params: InValue[]): Promise<T | undefined>;
  many<T>(sql: string, ...params: InValue[]): Promise<T[]>;
  run(sql: string, ...params: InValue[]): Promise<{ lastInsertRowid: number }>;
}

function toObjects<T>(result: ResultSet): T[] {
  return result.rows.map((row) => Object.fromEntries(result.columns.map((column, i) => [column, row[i]])) as T);
}

function queriesFor(executor: Pick<Transaction, "execute">): Queries {
  return {
    async one<T>(sql: string, ...params: InValue[]) {
      return toObjects<T>(await executor.execute({ sql, args: params }))[0];
    },
    async many<T>(sql: string, ...params: InValue[]) {
      return toObjects<T>(await executor.execute({ sql, args: params }));
    },
    async run(sql: string, ...params: InValue[]) {
      const result = await executor.execute({ sql, args: params });
      return { lastInsertRowid: Number(result.lastInsertRowid ?? 0) };
    },
  };
}

export const { one, many, run } = queriesFor(db);

export async function transaction<T>(work: (tx: Queries) => Promise<T>): Promise<T> {
  const tx = await db.transaction("write");
  try {
    const result = await work(queriesFor(tx));
    await tx.commit();
    return result;
  } finally {
    tx.close();
  }
}

export async function migrate(): Promise<void> {
  if (isLocalFile) await db.executeMultiple("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  await db.executeMultiple(schema);
}

export async function seed(): Promise<void> {
  const existing = await one<{ count: number }>("SELECT COUNT(*) AS count FROM topics");
  if (existing && existing.count > 0) return;
  await db.batch(
    defaultTopics.map((topic) => ({ sql: "INSERT INTO topics (name) VALUES (?)", args: [topic] })),
    "write",
  );
}

let ready: Promise<void> | undefined;

// Runs migrate + seed once per server instance (each serverless cold start), retrying after a failure.
export function ensureDatabase(): Promise<void> {
  ready ??= migrate()
    .then(seed)
    .catch((error: unknown) => {
      ready = undefined;
      throw error;
    });
  return ready;
}

export async function reset(): Promise<void> {
  await db.executeMultiple(`
    DROP TABLE IF EXISTS bookings;
    DROP TABLE IF EXISTS group_members;
    DROP TABLE IF EXISTS groups;
    DROP TABLE IF EXISTS venues;
    DROP TABLE IF EXISTS topics;
    DROP TABLE IF EXISTS students;
  `);
  await migrate();
  await seed();
}
