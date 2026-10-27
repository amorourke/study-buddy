import { NameForm } from "../../components/NameForm.tsx";
import { PageHeader } from "../../components/PageHeader.tsx";

export function AddVenuePage() {
  return (
    <>
      <PageHeader title="Add venue" />
      <NameForm label="Venue name" submitLabel="Add venue" cancelTo="/venues" />
    </>
  );
}
