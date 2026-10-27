import { data, type Params } from "react-router";

export function routeId(params: Params, name: string): number {
  const id = Number(params[name]);
  if (!Number.isInteger(id) || id <= 0) throw data(null, { status: 404, statusText: "Page not found" });
  return id;
}
