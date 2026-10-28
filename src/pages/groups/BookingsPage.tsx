import { Form, useActionData, useLoaderData } from "react-router";
import { slotLabel, TIME_SLOTS, todayIso } from "../../../shared/schemas.ts";
import { PageHeader } from "../../components/PageHeader.tsx";
import { ButtonLink } from "../../components/ui/Button.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import { FormError } from "../../components/ui/FormError.tsx";
import { SelectField } from "../../components/ui/SelectField.tsx";
import { SubmitButton } from "../../components/ui/SubmitButton.tsx";
import { Table, Td } from "../../components/ui/Table.tsx";
import { TextField } from "../../components/ui/TextField.tsx";
import { formatDate } from "../../lib/dates.ts";
import { fieldError, type FormResult } from "../../lib/forms.ts";
import type { BookingsData } from "./groups.data.ts";

export function BookingsPage() {
  const { group, venues, bookings } = useLoaderData<BookingsData>();
  const result = useActionData<FormResult>();

  return (
    <>
      <PageHeader
        title={`Bookings for ${group.name}`}
        action={
          <ButtonLink to={`/groups/${group.id}`} variant="secondary">
            Back to group
          </ButtonLink>
        }
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Make a booking</h2>
          {venues.length === 0 ? (
            <EmptyState message="There are no venues to book yet." action={<ButtonLink to="/venues/new">Add venue</ButtonLink>} />
          ) : (
            <Card>
              <Form method="post" noValidate className="space-y-5">
                <FormError message={result?.message} />
                <SelectField
                  label="Venue"
                  name="venueId"
                  placeholder="Choose a venue"
                  options={venues.map((venue) => ({ value: venue.id, label: venue.name }))}
                  error={fieldError(result, "venueId")}
                />
                <TextField label="Date" name="date" type="date" min={todayIso()} error={fieldError(result, "date")} />
                <SelectField
                  label="Time slot"
                  name="slot"
                  placeholder="Choose a time slot"
                  options={TIME_SLOTS.map((slot) => ({ value: slot, label: slotLabel(slot) }))}
                  error={fieldError(result, "slot")}
                />
                <SubmitButton pendingText="Booking…">Make booking</SubmitButton>
              </Form>
            </Card>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Booked sessions</h2>
          {bookings.length === 0 ? (
            <EmptyState message="This group has no bookings yet." />
          ) : (
            <Table headers={["Date", "Time", "Venue"]}>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <Td className="whitespace-nowrap">{formatDate(booking.date)}</Td>
                  <Td className="whitespace-nowrap">{slotLabel(booking.slot)}</Td>
                  <Td>{booking.venue.name}</Td>
                </tr>
              ))}
            </Table>
          )}
        </section>
      </div>
    </>
  );
}
