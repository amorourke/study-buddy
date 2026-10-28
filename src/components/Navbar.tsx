import { useState } from "react";
import { Form, Link, NavLink } from "react-router";
import { useUser } from "../lib/auth.ts";

const memberLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/groups", label: "Groups", end: true },
  { to: "/topics", label: "Topics", end: true },
  { to: "/venues", label: "Venues", end: true },
];

const guestLinks = [
  { to: "/register", label: "Register", end: true },
  { to: "/login", label: "Log in", end: true },
];

function linkClasses({ isActive }: { isActive: boolean }) {
  return `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

export function Navbar() {
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const links = user ? memberLinks : guestLinks;
  const close = () => setIsOpen(false);

  const logout = user && (
    <Form method="post" action="/logout" onSubmit={close}>
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        Log out
      </button>
    </Form>
  );

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            SB
          </span>
          Study Buddy
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClasses}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user && <span className="text-sm text-slate-500">{user.username}</span>}
          {logout}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isOpen ? "M6 18 18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"}
            />
          </svg>
        </button>
      </nav>

      {isOpen && (
        <div id="mobile-menu" className="space-y-1 border-t border-slate-200 px-4 py-3 lg:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClasses} onClick={close}>
              {link.label}
            </NavLink>
          ))}
          {logout}
        </div>
      )}
    </header>
  );
}
