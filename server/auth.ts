import type { CookieOptions, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import type { User } from "../shared/types.ts";
import { config } from "./config.ts";
import { one } from "./db.ts";
import { HttpError } from "./errors.ts";

declare global {
  namespace Express {
    interface Locals {
      user: User;
    }
  }
}

const COOKIE_NAME = "session";
const DAY_MS = 24 * 60 * 60 * 1000;
const REMEMBER_DAYS = 30;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.isProduction,
  path: "/",
};

export function signIn(res: Response, user: User, remember: boolean): void {
  const token = jwt.sign({ sub: String(user.id) }, config.jwtSecret, {
    expiresIn: remember ? `${REMEMBER_DAYS}d` : "1d",
  });
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: remember ? REMEMBER_DAYS * DAY_MS : undefined,
  });
}

export function signOut(res: Response): void {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

export function findUserById(id: number): User | undefined {
  return one<User>("SELECT id, username, email FROM students WHERE id = ?", id);
}

export function currentUser(req: Request): User | undefined {
  const token: unknown = req.cookies?.[COOKIE_NAME];
  if (typeof token !== "string") return undefined;
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (typeof payload === "string" || !payload.sub) return undefined;
    return findUserById(Number(payload.sub));
  } catch {
    return undefined;
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const user = currentUser(req);
  if (!user) throw new HttpError(401, "Please log in to continue.");
  res.locals.user = user;
  next();
};
