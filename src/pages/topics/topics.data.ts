import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { nameSchema } from "../../../shared/schemas.ts";
import { api } from "../../lib/api.ts";
import { flash } from "../../lib/flash.ts";
import { readForm, submitForm } from "../../lib/forms.ts";
import { routeId } from "../../lib/params.ts";

export function topicsLoader() {
  return api.topics.list();
}

export function editTopicLoader({ params }: LoaderFunctionArgs) {
  return api.topics.get(routeId(params, "topicId"));
}

export async function addTopicAction({ request }: ActionFunctionArgs) {
  const failure = await submitForm(await readForm(request), nameSchema, api.topics.create);
  if (failure) return failure;

  flash("Created a new topic");
  return redirect("/topics");
}

export async function editTopicAction({ request, params }: ActionFunctionArgs) {
  const id = routeId(params, "topicId");
  const failure = await submitForm(await readForm(request), nameSchema, (input) => api.topics.update(id, input));
  if (failure) return failure;

  flash("Topic successfully edited!");
  return redirect("/topics");
}
