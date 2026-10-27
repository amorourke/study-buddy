import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { bookingSchema, groupSchema } from "../../../shared/schemas.ts";
import type { Booking, Group, Topic, Venue } from "../../../shared/types.ts";
import { api, ApiError } from "../../lib/api.ts";
import { flash } from "../../lib/flash.ts";
import { readForm, submitForm } from "../../lib/forms.ts";
import { routeId } from "../../lib/params.ts";

export interface ManageGroupData {
  group: Group;
  topics: Topic[];
}

export interface BookingsData {
  group: Group;
  venues: Venue[];
  bookings: Booking[];
}

async function attempt(work: () => Promise<unknown>, successMessage: string): Promise<null> {
  try {
    await work();
    flash(successMessage);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    flash(error.message, "error");
  }
  return null;
}

export function groupsLoader() {
  return api.groups.list();
}

export async function groupsAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const groupId = Number(formData.get("groupId"));
  const groupName = String(formData.get("groupName"));
  return attempt(() => api.groups.join(groupId), `Successfully joined ${groupName}`);
}

export function addGroupLoader() {
  return api.topics.list();
}

export async function addGroupAction({ request }: ActionFunctionArgs) {
  const failure = await submitForm(await readForm(request), groupSchema, api.groups.create);
  if (failure) return failure;

  flash("Group created!");
  return redirect("/groups");
}

export async function manageGroupLoader({ params }: LoaderFunctionArgs): Promise<ManageGroupData> {
  const id = routeId(params, "groupId");
  const [user, group, topics] = await Promise.all([api.auth.me(), api.groups.get(id), api.topics.list()]);

  if (group.leader.id !== user?.id) {
    flash("Only the group leader can manage this group.", "error");
    throw redirect("/groups");
  }
  return { group, topics };
}

export async function manageGroupAction({ request, params }: ActionFunctionArgs) {
  const id = routeId(params, "groupId");
  const values = await readForm(request);

  if (values.intent === "remove") {
    return attempt(() => api.groups.removeMember(id, Number(values.studentId)), "Member removed");
  }

  const failure = await submitForm(values, groupSchema, (input) => api.groups.update(id, input));
  if (failure) return failure;

  flash("Group successfully edited!");
  return redirect("/groups");
}

export async function bookingsLoader({ params }: LoaderFunctionArgs): Promise<BookingsData> {
  const id = routeId(params, "groupId");
  const [group, venues, bookings] = await Promise.all([
    api.groups.get(id),
    api.venues.list(),
    api.groups.bookings(id),
  ]);
  return { group, venues, bookings };
}

export async function bookingsAction({ request, params }: ActionFunctionArgs) {
  const id = routeId(params, "groupId");
  const failure = await submitForm(await readForm(request), bookingSchema, (input) =>
    api.groups.createBooking(id, input),
  );
  if (failure) return failure;

  flash("Successfully created booking!");
  return redirect(new URL(request.url).pathname);
}
