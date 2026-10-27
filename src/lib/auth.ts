import { redirect, useRouteLoaderData, type LoaderFunctionArgs } from "react-router";
import type { User } from "../../shared/types.ts";
import { api } from "./api.ts";
import { flash } from "./flash.ts";

export const ROOT_ROUTE_ID = "root";

export function rootLoader(): Promise<User | null> {
  return api.auth.me();
}

export function useUser(): User | null {
  return (useRouteLoaderData(ROOT_ROUTE_ID) as User | null | undefined) ?? null;
}

export async function requireUser({ request }: LoaderFunctionArgs): Promise<User> {
  const user = await api.auth.me();
  if (!user) {
    const { pathname, search } = new URL(request.url);
    flash("Please log in to access that page.", "error");
    throw redirect(`/login?next=${encodeURIComponent(pathname + search)}`);
  }
  return user;
}

export async function guestOnly(): Promise<null> {
  if (await api.auth.me()) throw redirect("/");
  return null;
}

export function safeRedirectPath(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
