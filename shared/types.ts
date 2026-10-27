export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Topic {
  id: number;
  name: string;
}

export interface Venue {
  id: number;
  name: string;
}

export interface Member {
  id: number;
  username: string;
}

export interface Group {
  id: number;
  name: string;
  topic: Topic;
  leader: Member;
  members: Member[];
}

export interface Booking {
  id: number;
  date: string;
  slot: string;
  venue: Venue;
}

export type FieldErrors = Record<string, string[] | undefined>;

export interface ApiErrorBody {
  message: string;
  fieldErrors?: FieldErrors;
}
