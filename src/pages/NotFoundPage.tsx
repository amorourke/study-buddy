import { ButtonLink } from "../components/ui/Button.tsx";

export function NotFoundPage() {
  return (
    <section className="py-16 text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you're looking for doesn't exist.</p>
      <ButtonLink to="/" className="mt-6">
        Go home
      </ButtonLink>
    </section>
  );
}
