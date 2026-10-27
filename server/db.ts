import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync, type SQLInputValue, type StatementSync } from "node:sqlite";
import { config } from "./config.ts";

const databasePath = resolve(config.databasePath);
mkdirSync(dirname(databasePath), { recursive: true });

export const db = new DatabaseSync(databasePath);
db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");

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

export function migrate(): void {
  db.exec(schema);
}

export function seed(): void {
  const existing = one<{ count: number }>("SELECT COUNT(*) AS count FROM topics");
  if (existing && existing.count > 0) return;
  transaction(() => {
    for (const topic of defaultTopics) run("INSERT INTO topics (name) VALUES (?)", topic);
  });
}

export function reset(): void {
  db.exec(`
    DROP TABLE IF EXISTS bookings;
    DROP TABLE IF EXISTS group_members;
    DROP TABLE IF EXISTS groups;
    DROP TABLE IF EXISTS venues;
    DROP TABLE IF EXISTS topics;
    DROP TABLE IF EXISTS students;
  `);
  migrate();
  seed();
}

const statements = new Map<string, StatementSync>();

function statement(sql: string): StatementSync {
  let prepared = statements.get(sql);
  if (!prepared) {
    prepared = db.prepare(sql);
    statements.set(sql, prepared);
  }
  return prepared;
}

export function one<T>(sql: string, ...params: SQLInputValue[]): T | undefined {
  return statement(sql).get(...params) as T | undefined;
}

export function many<T>(sql: string, ...params: SQLInputValue[]): T[] {
  return statement(sql).all(...params) as T[];
}

export function run(sql: string, ...params: SQLInputValue[]) {
  return statement(sql).run(...params);
}

export function transaction<T>(work: () => T): T {
  db.exec("BEGIN");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
