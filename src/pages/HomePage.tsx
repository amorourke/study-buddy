import { ButtonLink } from "../components/ui/Button.tsx";
import { Card } from "../components/ui/Card.tsx";
import { useUser } from "../lib/auth.ts";

// TODO: add a route for this path once the "my groups" page exists.
const MY_GROUPS_PATH = "/groups/mine";

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
  {
    title: "Your groups",
    description: "See the groups you've joined or created, manage members and keep track of upcoming sessions.",
    to: MY_GROUPS_PATH,
    label: "View your groups",
  },
];

export function HomePage() {
  const user = useUser();

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

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
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
    </div>
  );
}
