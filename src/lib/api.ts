import type {
  BookingInput,
  GroupInput,
  LoginInput,
  NameInput,
  RegisterInput,
} from "../../shared/schemas.ts";
import type { ApiErrorBody, Booking, FieldErrors, Group, Topic, User, Venue } from "../../shared/types.ts";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: FieldErrors;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.status = status;
    this.fieldErrors = body.fieldErrors;
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody: ApiErrorBody = await response
      .json()
      .catch(() => ({ message: response.statusText || "Request failed" }));
    throw new ApiError(response.status, errorBody);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function namedResource<T>(path: string) {
  return {
    list: () => request<T[]>("GET", path),
    get: (id: number) => request<T>("GET", `${path}/${id}`),
    create: (input: NameInput) => request<T>("POST", path, input),
    update: (id: number, input: NameInput) => request<T>("PUT", `${path}/${id}`, input),
  };
}

export const api = {
  auth: {
    me: () => request<User | null>("GET", "/auth/me"),
    login: (input: LoginInput) => request<User>("POST", "/auth/login", input),
    register: (input: RegisterInput) => request<User>("POST", "/auth/register", input),
    logout: () => request<void>("POST", "/auth/logout"),
  },
  topics: namedResource<Topic>("/topics"),
  venues: namedResource<Venue>("/venues"),
  groups: {
    list: () => request<Group[]>("GET", "/groups"),
    get: (id: number) => request<Group>("GET", `/groups/${id}`),
    create: (input: GroupInput) => request<Group>("POST", "/groups", input),
    update: (id: number, input: GroupInput) => request<Group>("PUT", `/groups/${id}`, input),
    join: (id: number) => request<Group>("POST", `/groups/${id}/join`),
    removeMember: (id: number, studentId: number) =>
      request<void>("DELETE", `/groups/${id}/members/${studentId}`),
    bookings: (id: number) => request<Booking[]>("GET", `/groups/${id}/bookings`),
    createBooking: (id: number, input: BookingInput) =>
      request<void>("POST", `/groups/${id}/bookings`, input),
  },
};
