import { Link, useLoaderData } from "react-router";
import type { Group } from "../../shared/types.ts";
import { ButtonLink } from "../components/ui/Button.tsx";
import { Card } from "../components/ui/Card.tsx";
import { useUser } from "../lib/auth.ts";

const actions = [
  {
    title: "Join a group",
    description:
      "Browse the study groups other students have set up, find one that matches your topic and join with a single click.",
    to: "/groups",
    label: "Browse groups",
  },
  {
    title: "Create a group",
    description:
      "Can't find what you're looking for? Start your own group, pick a topic and invite others to study with you.",
    to: "/groups/new",
    label: "Create a group",
  },
];

function MyGroups({ groups }: { groups: Group[] }) {
  return (
    <Card className="flex flex-col">
      <h2 className="text-lg font-semibold text-slate-900">Your groups</h2>
      {groups.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">You haven't joined any groups yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                to={`/groups/${group.id}`}
                className="-mx-2 flex items-center justify-between rounded-md px-2 py-2 hover:bg-slate-50"
              >
                <span>
                  <span className="block text-sm font-medium text-slate-900">{group.name}</span>
                  <span className="block text-xs text-slate-500">{group.topic.name}</span>
                </span>
                <span className="text-xs text-slate-500">
                  {group.members.length} {group.members.length === 1 ? "member" : "members"}
                </span>
              </Link>
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

export function HomePage() {
  const user = useUser();
  const myGroups = useLoaderData<Group[]>();

  return (
    <div className="py-16">
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

      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        {actions.map((action) => (
          <Card key={action.title} className="flex flex-col">
            <h2 className="text-lg font-semibold text-slate-900">{action.title}</h2>
            <p className="mt-2 flex-1 text-sm text-slate-600">{action.description}</p>
            <ButtonLink to={action.to} className="mt-6 self-start">
              {action.label}
            </ButtonLink>
          </Card>
        ))}
      </section>

      {user && (
        <section className="mt-6">
          <MyGroups groups={myGroups} />
        </section>
      )}
    </div>
  );
}
