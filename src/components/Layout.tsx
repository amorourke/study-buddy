import { Outlet, useNavigation } from "react-router";
import { FlashMessages } from "./FlashMessages.tsx";
import { Navbar } from "./Navbar.tsx";

export function Layout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className="flex min-h-screen flex-col">
      <div
        className={`fixed inset-x-0 top-0 z-50 h-0.5 bg-indigo-600 transition-opacity ${isLoading ? "opacity-100" : "opacity-0"}`}
      />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <FlashMessages />
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <p className="mx-auto max-w-6xl px-4 py-4 text-sm text-slate-500">© {new Date().getFullYear()} Study Buddy</p>
      </footer>
    </div>
  );
}
