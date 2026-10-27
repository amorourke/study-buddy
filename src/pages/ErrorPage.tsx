import { isRouteErrorResponse, useRouteError } from "react-router";
import { ButtonLink } from "../components/ui/Button.tsx";
import { ApiError } from "../lib/api.ts";

const titles: Record<number, string> = {
  401: "Logged out",
  403: "Not allowed",
  404: "Not found",
};

function describe(error: unknown): { title: string; message: string; status?: number } {
  if (error instanceof ApiError) {
    return { title: titles[error.status] ?? "Something went wrong", message: error.message, status: error.status };
  }
  if (isRouteErrorResponse(error)) {
    return { title: titles[error.status] ?? `Error ${error.status}`, message: error.statusText };
  }
  return { title: "Something went wrong", message: "An unexpected error occurred. Please try again." };
}

export function ErrorPage() {
  const { title, message, status } = describe(useRouteError());
  const isLoggedOut = status === 401;

  return (
    <section className="px-4 py-16 text-center">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-slate-600">{message}</p>
      <ButtonLink to={isLoggedOut ? "/login" : "/"} className="mt-6">
        {isLoggedOut ? "Log in" : "Go home"}
      </ButtonLink>
    </section>
  );
}
