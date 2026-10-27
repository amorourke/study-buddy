import { dismissFlash, useFlashMessages, type FlashType } from "../lib/flash.ts";

const styles: Record<FlashType, string> = {
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  error: "bg-red-50 text-red-800 ring-red-200",
  info: "bg-sky-50 text-sky-800 ring-sky-200",
};

export function FlashMessages() {
  const messages = useFlashMessages();
  if (messages.length === 0) return null;

  return (
    <div className="mb-6 space-y-2" aria-live="polite">
      {messages.map(({ id, type, message }) => (
        <div
          key={id}
          role={type === "error" ? "alert" : "status"}
          className={`flex items-start justify-between gap-4 rounded-lg px-4 py-3 text-sm ring-1 ring-inset ${styles[type]}`}
        >
          <span>{message}</span>
          <button
            type="button"
            onClick={() => dismissFlash(id)}
            className="opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
