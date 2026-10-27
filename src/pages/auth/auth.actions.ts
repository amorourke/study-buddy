import { redirect, type ActionFunctionArgs } from "react-router";
import { loginSchema, registerSchema } from "../../../shared/schemas.ts";
import { api } from "../../lib/api.ts";
import { safeRedirectPath } from "../../lib/auth.ts";
import { flash } from "../../lib/flash.ts";
import { readForm, submitForm } from "../../lib/forms.ts";

export async function loginAction({ request }: ActionFunctionArgs) {
  const failure = await submitForm(await readForm(request), loginSchema, api.auth.login);
  if (failure) return failure;

  flash("Login successful");
  return redirect(safeRedirectPath(new URL(request.url).searchParams.get("next")));
}

export async function registerAction({ request }: ActionFunctionArgs) {
  const failure = await submitForm(await readForm(request), registerSchema, api.auth.register);
  if (failure) return failure;

  flash("Registered and logged in successfully!");
  return redirect("/");
}

export async function logoutAction() {
  await api.auth.logout();
  flash("Successfully logged out");
  return redirect("/");
}
