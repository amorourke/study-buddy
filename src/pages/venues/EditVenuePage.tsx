import { useLoaderData } from "react-router";
import type { Venue } from "../../../shared/types.ts";
import { NameForm } from "../../components/NameForm.tsx";
import { PageHeader } from "../../components/PageHeader.tsx";

export function EditVenuePage() {
  const venue = useLoaderData<Venue>();

  return (
    <>
      <PageHeader title="Edit venue" />
      <NameForm label="Venue name" submitLabel="Save changes" cancelTo="/venues" defaultValue={venue.name} />
    </>
  );
}
