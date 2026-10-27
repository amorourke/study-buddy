import { useLoaderData } from "react-router";
import type { Venue } from "../../../shared/types.ts";
import { PageHeader } from "../../components/PageHeader.tsx";
import { ButtonLink } from "../../components/ui/Button.tsx";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import { Table, Td } from "../../components/ui/Table.tsx";

export function VenuesPage() {
  const venues = useLoaderData<Venue[]>();
  const addButton = <ButtonLink to="/venues/new">Add venue</ButtonLink>;

  return (
    <>
      <PageHeader title="Venues" description="Rooms and spaces that groups can book." action={addButton} />
      {venues.length === 0 ? (
        <EmptyState message="No venues yet." action={addButton} />
      ) : (
        <Table headers={["Venue name", ""]}>
          {venues.map((venue) => (
            <tr key={venue.id}>
              <Td className="font-medium text-slate-900">{venue.name}</Td>
              <Td className="text-right">
                <ButtonLink to={`/venues/${venue.id}/edit`} variant="secondary" size="sm">
                  Edit
                </ButtonLink>
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
