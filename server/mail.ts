import nodemailer from "nodemailer";
import { config } from "./config.ts";

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: false,
  ignoreTLS: !config.mail.user,
  auth: config.mail.user ? { user: config.mail.user, pass: config.mail.password } : undefined,
});

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

interface RemovedEmail {
  to: string;
  username: string;
  groupName: string;
  topicName: string;
}

export async function sendRemovedFromGroupEmail({ to, username, groupName, topicName }: RemovedEmail) {
  const text = [
    `Hi ${username},`,
    "",
    `You have been removed from the group ${groupName} (${topicName}).`,
    "",
    "If you think this was a mistake, contact your group leader.",
    "",
    "Thanks,",
    "The Study Buddy Team",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>You've been removed from a group</h2>
      <p>Hi ${escapeHtml(username)},</p>
      <p>You have been removed from the group <strong>${escapeHtml(groupName)}</strong> (${escapeHtml(topicName)}).</p>
      <p>If you think this was a mistake, contact your group leader.</p>
      <p>Thanks,<br>The Study Buddy Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: config.mail.from,
    to,
    subject: "You have been removed from a group",
    text,
    html,
  });
}
