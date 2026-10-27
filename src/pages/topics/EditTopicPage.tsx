import { useLoaderData } from "react-router";
import type { Topic } from "../../../shared/types.ts";
import { NameForm } from "../../components/NameForm.tsx";
import { PageHeader } from "../../components/PageHeader.tsx";

export function EditTopicPage() {
  const topic = useLoaderData<Topic>();

  return (
    <>
      <PageHeader title="Edit topic" />
      <NameForm label="Topic name" submitLabel="Save changes" cancelTo="/topics" defaultValue={topic.name} />
    </>
  );
}
