import bcrypt from "bcryptjs";
import { Router } from "express";
import { loginSchema, registerSchema } from "../../shared/schemas.ts";
import { currentUser, findUserById, signIn, signOut } from "../auth.ts";
import { one, run } from "../db.ts";
import { conflict, HttpError } from "../errors.ts";

export const authRouter = Router();

authRouter.get("/me", (req, res) => {
  res.json(currentUser(req) ?? null);
});

authRouter.post("/register", async (req, res) => {
  const { username, email, password } = registerSchema.parse(req.body);

  if (one("SELECT 1 FROM students WHERE username = ?", username)) {
    throw conflict("username", "That username already exists");
  }
  if (one("SELECT 1 FROM students WHERE email = ?", email)) {
    throw conflict("email", "That email is already used by another account");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { lastInsertRowid } = run(
    "INSERT INTO students (username, email, password_hash) VALUES (?, ?, ?)",
    username,
    email,
    passwordHash,
  );

  const user = findUserById(Number(lastInsertRowid));
  if (!user) throw new HttpError(500, "Could not create account");

  signIn(res, user, false);
  res.status(201).json(user);
});

authRouter.post("/login", async (req, res) => {
  const { username, password, rememberMe } = loginSchema.parse(req.body);

  const student = one<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM students WHERE username = ?",
    username,
  );
  const valid = student ? await bcrypt.compare(password, student.password_hash) : false;
  const user = student && valid ? findUserById(student.id) : undefined;

  if (!user) throw new HttpError(401, "Incorrect username or password");

  signIn(res, user, rememberMe);
  res.json(user);
});

authRouter.post("/logout", (_req, res) => {
  signOut(res);
  res.status(204).end();
});
