import bcrypt from "bcryptjs";
import type { InStatement } from "@libsql/client";
import { db, ensureDatabase, one } from "./db.ts";

// Adds sample students, venues, groups and bookings without touching existing data.
// Usage: npm run db:mock [-- <your-username>]  (also adds that user to a few groups)

const MOCK_PASSWORD = process.env.MOCK_PASSWORD;
if (!MOCK_PASSWORD) {
  console.error("Set MOCK_PASSWORD in .env (see .env.example) before adding mock data.");
  process.exit(1);
}

const students = ["alice", "ben", "chloe", "dev", "ella", "finn", "grace", "harry"];

const venues = ["Main Library Room 1", "Main Library Room 2", "Science Block S12", "Student Union Cafe", "Quiet Study Pod"];

const groups: { name: string; topic: string; leader: string; members: string[] }[] = [
  { name: "Algorithms Crew", topic: "Computer Science", leader: "alice", members: ["ben", "dev", "grace"] },
  { name: "Web Dev Wednesdays", topic: "Computer Science", leader: "dev", members: ["alice", "finn"] },
  { name: "Shakespeare Circle", topic: "English", leader: "chloe", members: ["ella", "harry"] },
  { name: "Essay Clinic", topic: "English", leader: "ella", members: ["chloe"] },
  { name: "Chem Revision", topic: "Science", leader: "finn", members: ["ben", "grace", "harry"] },
  { name: "Calculus Club", topic: "Maths", leader: "grace", members: ["alice", "dev", "ella"] },
  { name: "Stats Study Hall", topic: "Maths", leader: "ben", members: [] },
];

// Day offsets are relative to today, so bookings stay upcoming whenever the script runs.
const bookings: { group: string; venue: string; inDays: number; slot: string }[] = [
  { group: "Algorithms Crew", venue: "Main Library Room 1", inDays: 1, slot: "10:00" },
  { group: "Algorithms Crew", venue: "Main Library Room 1", inDays: 8, slot: "10:00" },
  { group: "Web Dev Wednesdays", venue: "Student Union Cafe", inDays: 2, slot: "14:00" },
  { group: "Shakespeare Circle", venue: "Quiet Study Pod", inDays: 3, slot: "11:00" },
  { group: "Essay Clinic", venue: "Main Library Room 2", inDays: 1, slot: "13:00" },
  { group: "Chem Revision", venue: "Science Block S12", inDays: 4, slot: "09:00" },
  { group: "Chem Revision", venue: "Science Block S12", inDays: 11, slot: "09:00" },
  { group: "Calculus Club", venue: "Main Library Room 2", inDays: 5, slot: "15:00" },
  { group: "Calculus Club", venue: "Main Library Room 1", inDays: -3, slot: "12:00" },
];

const joinAs = process.argv[2]?.trim().toLowerCase();
const groupsForJoinAs = ["Algorithms Crew", "Chem Revision", "Calculus Club"];

function isoDateInDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const studentId = "(SELECT id FROM students WHERE username = ?)";
const groupId = "(SELECT id FROM groups WHERE name = ?)";

await ensureDatabase();

if (joinAs && !(await one("SELECT 1 FROM students WHERE username = ?", joinAs))) {
  console.error(`No student called "${joinAs}" - register that account first.`);
  process.exit(1);
}

const passwordHash = await bcrypt.hash(MOCK_PASSWORD, 12);
const statements: InStatement[] = [];

for (const username of students) {
  statements.push({
    sql: "INSERT OR IGNORE INTO students (username, email, password_hash) VALUES (?, ?, ?)",
    args: [username, `${username}@example.com`, passwordHash],
  });
}

for (const venue of venues) statements.push({ sql: "INSERT OR IGNORE INTO venues (name) VALUES (?)", args: [venue] });

for (const group of groups) {
  statements.push({
    sql: `INSERT OR IGNORE INTO groups (name, topic_id, leader_id)
          VALUES (?, (SELECT id FROM topics WHERE name = ?), ${studentId})`,
    args: [group.name, group.topic, group.leader],
  });
  for (const member of [group.leader, ...group.members]) {
    statements.push({
      sql: `INSERT OR IGNORE INTO group_members (group_id, student_id) VALUES (${groupId}, ${studentId})`,
      args: [group.name, member],
    });
  }
}

if (joinAs) {
  for (const name of groupsForJoinAs) {
    statements.push({
      sql: `INSERT OR IGNORE INTO group_members (group_id, student_id) VALUES (${groupId}, ${studentId})`,
      args: [name, joinAs],
    });
  }
}

for (const booking of bookings) {
  statements.push({
    sql: `INSERT OR IGNORE INTO bookings (group_id, venue_id, date, slot)
          VALUES (${groupId}, (SELECT id FROM venues WHERE name = ?), ?, ?)`,
    args: [booking.group, booking.venue, isoDateInDays(booking.inDays), booking.slot],
  });
}

// A batch runs as one transaction: if any lookup fails, nothing is written.
await db.batch(statements, "write");

console.log("Mock data added. Mock students log in with the MOCK_PASSWORD from your environment.");
if (joinAs) console.log(`Added ${joinAs} to: ${groupsForJoinAs.join(", ")}.`);
