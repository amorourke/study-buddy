import { Router } from "express";
import { bookingSchema, groupSchema } from "../../shared/schemas.ts";
import type { Booking, Group, Member } from "../../shared/types.ts";
import { many, one, run, transaction } from "../db.ts";
import { conflict, forbidden, HttpError, notFound, paramId } from "../errors.ts";

interface GroupRow {
  id: number;
  name: string;
  topicId: number;
  topicName: string;
  leaderId: number;
  leaderUsername: string;
}

interface MemberRow extends Member {
  groupId: number;
}

interface BookingRow {
  id: number;
  date: string;
  slot: string;
  venueId: number;
  venueName: string;
}

const groupSelect = `
  SELECT g.id, g.name, t.id AS topicId, t.name AS topicName, s.id AS leaderId, s.username AS leaderUsername
  FROM groups g
  JOIN topics t ON t.id = g.topic_id
  JOIN students s ON s.id = g.leader_id
`;

const memberSelect = `
  SELECT m.group_id AS groupId, s.id, s.username
  FROM group_members m
  JOIN students s ON s.id = m.student_id
`;

function toGroup(row: GroupRow, members: MemberRow[]): Group {
  return {
    id: row.id,
    name: row.name,
    topic: { id: row.topicId, name: row.topicName },
    leader: { id: row.leaderId, username: row.leaderUsername },
    members: members
      .filter((member) => member.groupId === row.id)
      .map(({ id, username }) => ({ id, username })),
  };
}

async function listGroups(): Promise<Group[]> {
  const [rows, members] = await Promise.all([
    many<GroupRow>(`${groupSelect} ORDER BY g.name`),
    many<MemberRow>(`${memberSelect} ORDER BY s.username`),
  ]);
  return rows.map((row) => toGroup(row, members));
}

async function findGroup(id: number): Promise<Group | undefined> {
  const row = await one<GroupRow>(`${groupSelect} WHERE g.id = ?`, id);
  if (!row) return undefined;
  return toGroup(row, await many<MemberRow>(`${memberSelect} WHERE m.group_id = ? ORDER BY s.username`, id));
}

async function getGroup(id: number): Promise<Group> {
  const group = await findGroup(id);
  if (!group) throw notFound("Group");
  return group;
}

function isMember(group: Group, studentId: number): boolean {
  return group.members.some((member) => member.id === studentId);
}

async function assertTopicExists(topicId: number): Promise<void> {
  if (!(await one("SELECT 1 FROM topics WHERE id = ?", topicId))) throw conflict("topicId", "Choose a valid topic");
}

async function assertUniqueName(name: string, excludeId = 0): Promise<void> {
  if (await one("SELECT 1 FROM groups WHERE name = ? AND id != ?", name, excludeId)) {
    throw conflict("name", "A group with that name already exists");
  }
}

export const groupsRouter = Router();

groupsRouter.get("/", async (_req, res) => {
  res.json(await listGroups());
});

groupsRouter.post("/", async (req, res) => {
  const { name, topicId } = groupSchema.parse(req.body);
  await assertUniqueName(name);
  await assertTopicExists(topicId);

  const userId = res.locals.user.id;
  const groupId = await transaction(async (tx) => {
    const { lastInsertRowid } = await tx.run(
      "INSERT INTO groups (name, topic_id, leader_id) VALUES (?, ?, ?)",
      name,
      topicId,
      userId,
    );
    await tx.run("INSERT INTO group_members (group_id, student_id) VALUES (?, ?)", lastInsertRowid, userId);
    return lastInsertRowid;
  });

  res.status(201).json(await getGroup(groupId));
});

groupsRouter.get("/:id", async (req, res) => {
  res.json(await getGroup(paramId(req, "id")));
});

groupsRouter.put("/:id", async (req, res) => {
  const group = await getGroup(paramId(req, "id"));
  if (group.leader.id !== res.locals.user.id) throw forbidden("Only the group leader can edit this group");

  const { name, topicId } = groupSchema.parse(req.body);
  await assertUniqueName(name, group.id);
  await assertTopicExists(topicId);

  await run("UPDATE groups SET name = ?, topic_id = ? WHERE id = ?", name, topicId, group.id);
  res.json(await getGroup(group.id));
});

groupsRouter.post("/:id/join", async (req, res) => {
  const group = await getGroup(paramId(req, "id"));
  const userId = res.locals.user.id;
  if (isMember(group, userId)) throw new HttpError(409, `You are already a member of ${group.name}`);

  await run("INSERT INTO group_members (group_id, student_id) VALUES (?, ?)", group.id, userId);
  res.json(await getGroup(group.id));
});

groupsRouter.delete("/:id/members/:studentId", async (req, res) => {
  const group = await getGroup(paramId(req, "id"));
  const studentId = paramId(req, "studentId");

  if (group.leader.id !== res.locals.user.id) throw forbidden("Only the group leader can remove members");
  if (studentId === group.leader.id) throw new HttpError(400, "The group leader can't be removed");

  if (!isMember(group, studentId)) throw notFound("Member");

  await run("DELETE FROM group_members WHERE group_id = ? AND student_id = ?", group.id, studentId);
  res.status(204).end();
});

groupsRouter.get("/:id/bookings", async (req, res) => {
  const group = await getGroup(paramId(req, "id"));
  if (!isMember(group, res.locals.user.id)) throw forbidden("Only group members can view bookings");

  const rows = await many<BookingRow>(
    `SELECT b.id, b.date, b.slot, v.id AS venueId, v.name AS venueName
     FROM bookings b JOIN venues v ON v.id = b.venue_id
     WHERE b.group_id = ? ORDER BY b.date, b.slot`,
    group.id,
  );
  const bookings: Booking[] = rows.map((row) => ({
    id: row.id,
    date: row.date,
    slot: row.slot,
    venue: { id: row.venueId, name: row.venueName },
  }));
  res.json(bookings);
});

groupsRouter.post("/:id/bookings", async (req, res) => {
  const group = await getGroup(paramId(req, "id"));
  if (!isMember(group, res.locals.user.id)) throw forbidden("Only group members can make bookings");

  const { venueId, date, slot } = bookingSchema.parse(req.body);
  if (!(await one("SELECT 1 FROM venues WHERE id = ?", venueId))) throw conflict("venueId", "Choose a valid venue");
  if (await one("SELECT 1 FROM bookings WHERE venue_id = ? AND date = ? AND slot = ?", venueId, date, slot)) {
    throw conflict("slot", "That venue is already booked for this time");
  }

  await run(
    "INSERT INTO bookings (group_id, venue_id, date, slot) VALUES (?, ?, ?, ?)",
    group.id,
    venueId,
    date,
    slot,
  );
  res.status(204).end();
});
