import bcrypt from "bcryptjs";
import { migrate, one, run, seed, transaction } from "./db.ts";

// Adds sample students, venues, groups and bookings without touching existing data.
// Usage: npm run db:mock [-- <your-username>]  (also adds that user to a few groups)

const MOCK_PASSWORD = "Password!";

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

function idOf(table: string, column: string, value: string): number {
  const row = one<{ id: number }>(`SELECT id FROM ${table} WHERE ${column} = ?`, value);
  if (!row) throw new Error(`No ${table} row with ${column} = ${value}`);
  return row.id;
}

migrate();
seed();

const passwordHash = await bcrypt.hash(MOCK_PASSWORD, 12);

if (joinAs && !one("SELECT 1 FROM students WHERE username = ?", joinAs)) {
  console.error(`No student called "${joinAs}" - register that account first.`);
  process.exit(1);
}

transaction(() => {
  for (const username of students) {
    run(
      "INSERT OR IGNORE INTO students (username, email, password_hash) VALUES (?, ?, ?)",
      username,
      `${username}@example.com`,
      passwordHash,
    );
  }

  for (const venue of venues) run("INSERT OR IGNORE INTO venues (name) VALUES (?)", venue);

  for (const group of groups) {
    run(
      "INSERT OR IGNORE INTO groups (name, topic_id, leader_id) VALUES (?, ?, ?)",
      group.name,
      idOf("topics", "name", group.topic),
      idOf("students", "username", group.leader),
    );
    const groupId = idOf("groups", "name", group.name);
    for (const member of [group.leader, ...group.members]) {
      run(
        "INSERT OR IGNORE INTO group_members (group_id, student_id) VALUES (?, ?)",
        groupId,
        idOf("students", "username", member),
      );
    }
  }

  if (joinAs) {
    const studentId = idOf("students", "username", joinAs);
    for (const name of groupsForJoinAs) {
      run(
        "INSERT OR IGNORE INTO group_members (group_id, student_id) VALUES (?, ?)",
        idOf("groups", "name", name),
        studentId,
      );
    }
  }

  for (const booking of bookings) {
    run(
      "INSERT OR IGNORE INTO bookings (group_id, venue_id, date, slot) VALUES (?, ?, ?, ?)",
      idOf("groups", "name", booking.group),
      idOf("venues", "name", booking.venue),
      isoDateInDays(booking.inDays),
      booking.slot,
    );
  }
});

console.log(`Mock data added. Mock students log in with password "${MOCK_PASSWORD}".`);
if (joinAs) console.log(`Added ${joinAs} to: ${groupsForJoinAs.join(", ")}.`);
