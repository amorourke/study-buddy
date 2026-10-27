export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
      {message}
    </div>
  );
}
