import { ButtonLink } from "../components/ui/Button.tsx";
import { useUser } from "../lib/auth.ts";

export function HomePage() {
  const user = useUser();

  return (
    <section className="py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Study Buddy</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
        {user
          ? `Welcome back, ${user.username}. Find a study group or book a venue for your next session.`
          : "Join study groups, meet other students and book venues for your sessions."}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        {user ? (
          <>
            <ButtonLink to="/groups">Browse groups</ButtonLink>
            <ButtonLink to="/groups/new" variant="secondary">
              Create a group
            </ButtonLink>
          </>
        ) : (
          <>
            <ButtonLink to="/register">Get started</ButtonLink>
            <ButtonLink to="/login" variant="secondary">
              Log in
            </ButtonLink>
          </>
        )}
      </div>
    </section>
  );
}
