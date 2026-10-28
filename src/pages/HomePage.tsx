import { Link, useLoaderData } from "react-router";
import { slotLabel } from "../../shared/schemas.ts";
import type { Group } from "../../shared/types.ts";
import { ButtonLink } from "../components/ui/Button.tsx";
import { Card } from "../components/ui/Card.tsx";
import { useUser } from "../lib/auth.ts";
import { formatDate } from "../lib/dates.ts";
import type { HomeData, UpcomingBooking } from "./groups/groups.data.ts";

const actions = [
  {
    title: "Browse groups",
    description: "See every study group on Study Buddy, what topic it covers, who leads it and how many members it has.",
    to: "/groups",
    label: "Browse groups",
  },
  {
    title: "Join a group",
    description: "Found a group that matches your topic? Join it with a single click and start booking sessions together.",
    to: "/groups",
    label: "Find a group to join",
  },
  {
    title: "Create a group",
    description:
      "Can't find what you're looking for? Start your own group, pick a topic and invite others to study with you.",
    to: "/groups/new",
    label: "Create a group",
  },
];


export function HomePage() {
  const user = useUser();
  const { groups: myGroups, upcomingBookings } = useLoaderData<HomeData>();

  return (
    <div className="pt-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Study Buddy</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          {user
            ? `Welcome back, ${user.username}. Join a group, start your own or check in on the groups you're already part of.`
            : "Join study groups, meet other students and book venues for your sessions."}
        </p>
        {!user && (
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink to="/register">Get started</ButtonLink>
            <ButtonLink to="/login" variant="secondary">
              Log in
            </ButtonLink>
          </div>
        )}
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {actions.map((action) => (
          <Card key={action.title} className="flex flex-col">
            <h2 className="text-lg font-semibold text-slate-900">{action.title}</h2>
            <p className="mt-2 flex-1 text-sm text-slate-600">{action.description}</p>
            <ButtonLink to={action.to} variant="outline" className="mt-6 self-start">
              {action.label}
            </ButtonLink>
          </Card>
        ))}
      </section>

      {user && (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <MyGroups groups={myGroups} />
          <UpcomingBookings bookings={upcomingBookings} />
        </section>
      )}
    </div>
  );
}

function MyGroups({ groups }: { groups: Group[] }) {
  return (
    <Card className="flex flex-col">
      <h2 className="text-lg font-semibold text-slate-900">Your groups</h2>
      {groups.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">You haven't joined any groups yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {groups.map((group) => (
            <li key={group.id} className="flex items-center gap-4 py-2">
              <Link
                to={`/groups/${group.id}`}
                className="-mx-2 flex flex-1 items-center justify-between rounded-md px-2 py-2 hover:bg-slate-50"
              >
                <span>
                  <span className="block text-sm font-medium text-slate-900">{group.name}</span>
                  <span className="block text-xs text-slate-500">{group.topic.name}</span>
                </span>
                <span className="text-xs text-slate-500">
                  {group.members.length} {group.members.length === 1 ? "member" : "members"}
                </span>
              </Link>
              <ButtonLink to={`/groups/${group.id}/bookings`} variant="secondary" size="sm">
                Make a booking
              </ButtonLink>
            </li>
          ))}
        </ul>
      )}
      <ButtonLink to="/groups?mine=1" variant="secondary" className="mt-6 self-start">
        View all your groups
      </ButtonLink>
    </Card>
  );
}

function UpcomingBookings({ bookings }: { bookings: UpcomingBooking[] }) {
  return (
    <Card className="flex flex-col">
      <h2 className="text-lg font-semibold text-slate-900">Upcoming bookings</h2>
      {bookings.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">None of your groups have any sessions booked yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {bookings.map((booking) => (
            <li key={booking.id} className="flex items-center justify-between gap-4 py-3">
              <span>
                <span className="block text-sm font-medium text-slate-900">{booking.venue.name}</span>
                <span className="block text-xs text-slate-500">
                  {formatDate(booking.date)} · {slotLabel(booking.slot)}
                </span>
              </span>
              <Link
                to={`/groups/${booking.group.id}`}
                className="text-right text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                {booking.group.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
