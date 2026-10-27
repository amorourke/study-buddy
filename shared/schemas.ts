import { z } from "zod";

export const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export function slotLabel(slot: string): string {
  const hour = Number(slot.slice(0, 2));
  return `${slot} – ${String(hour + 1).padStart(2, "0")}:00`;
}

export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const name = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(30, "Must be 30 characters or fewer");

const id = (message: string) => z.coerce.number({ error: message }).int(message).positive(message);

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Username is required")
      .max(30, "Must be 30 characters or fewer"),
    email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[!*.?]/, "Password must contain one of: ! * . ?"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.coerce.boolean().default(false),
});

export const nameSchema = z.object({ name });

export const groupSchema = z.object({
  name,
  topicId: id("Choose a topic"),
});

export const bookingSchema = z.object({
  venueId: id("Choose a venue"),
  date: z.iso
    .date("Choose a date")
    .refine((date) => date >= todayIso(), "Date can't be in the past"),
  slot: z.enum(TIME_SLOTS, "Choose a time slot"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type NameInput = z.infer<typeof nameSchema>;
export type GroupInput = z.infer<typeof groupSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
