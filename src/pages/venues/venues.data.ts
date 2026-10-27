import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { nameSchema } from "../../../shared/schemas.ts";
import { api } from "../../lib/api.ts";
import { flash } from "../../lib/flash.ts";
import { readForm, submitForm } from "../../lib/forms.ts";
import { routeId } from "../../lib/params.ts";

export function venuesLoader() {
  return api.venues.list();
}

export function editVenueLoader({ params }: LoaderFunctionArgs) {
  return api.venues.get(routeId(params, "venueId"));
}

export async function addVenueAction({ request }: ActionFunctionArgs) {
  const failure = await submitForm(await readForm(request), nameSchema, api.venues.create);
  if (failure) return failure;

  flash("Created a new venue");
  return redirect("/venues");
}

export async function editVenueAction({ request, params }: ActionFunctionArgs) {
  const id = routeId(params, "venueId");
  const failure = await submitForm(await readForm(request), nameSchema, (input) => api.venues.update(id, input));
  if (failure) return failure;

  flash("Venue successfully edited!");
  return redirect("/venues");
}
