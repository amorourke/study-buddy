import { useSyncExternalStore } from "react";

export type FlashType = "success" | "error" | "info";

export interface FlashMessage {
  id: number;
  type: FlashType;
  message: string;
}

const DISMISS_AFTER_MS = 5000;

let messages: FlashMessage[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function dismissFlash(id: number) {
  messages = messages.filter((message) => message.id !== id);
  emit();
}

export function flash(message: string, type: FlashType = "success") {
  const id = nextId++;
  messages = [...messages, { id, type, message }];
  emit();
  setTimeout(() => dismissFlash(id), DISMISS_AFTER_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useFlashMessages(): FlashMessage[] {
  return useSyncExternalStore(subscribe, () => messages);
}
