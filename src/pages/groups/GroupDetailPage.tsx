import { useLoaderData } from "react-router";
import { slotLabel } from "../../../shared/schemas.ts";
import { PageHeader } from "../../components/PageHeader.tsx";
import { ButtonLink } from "../../components/ui/Button.tsx";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import { Table, Td } from "../../components/ui/Table.tsx";
import { useUser } from "../../lib/auth.ts";
import { formatDate } from "../../lib/dates.ts";
import type { GroupDetailData } from "./groups.data.ts";

export function GroupDetailPage() {
  const { group, bookings } = useLoaderData<GroupDetailData>();
  const user = useUser();
  const isLeader = group.leader.id === user?.id;
  const bookingButton = <ButtonLink to={`/groups/${group.id}/bookings`}>Make a booking</ButtonLink>;

  return (
    <>
      <PageHeader
        title={group.name}
        description={`${group.topic.name} · led by ${group.leader.username}`}
        action={
          <div className="flex gap-3">
            {bookingButton}
            {isLeader && (
              <ButtonLink to={`/groups/${group.id}/manage`} variant="secondary">
                Manage
              </ButtonLink>
            )}
            <ButtonLink to="/groups" variant="secondary">
              Back to groups
            </ButtonLink>
          </div>
        }
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Members</h2>
          <Table headers={["Student", ""]}>
            {group.members.map((member) => (
              <tr key={member.id}>
                <Td className="font-medium text-slate-900">{member.username}</Td>
                <Td className="text-right">
                  {member.id === group.leader.id && (
                    <span className="text-xs font-medium text-indigo-600">Leader</span>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Booked sessions</h2>
          {bookings.length === 0 ? (
            <EmptyState message="This group has no bookings yet." action={bookingButton} />
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
