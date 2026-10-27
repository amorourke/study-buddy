import { NameForm } from "../../components/NameForm.tsx";
import { PageHeader } from "../../components/PageHeader.tsx";

export function AddTopicPage() {
  return (
    <>
      <PageHeader title="Add topic" />
      <NameForm label="Topic name" submitLabel="Add topic" cancelTo="/topics" />
    </>
  );
}
