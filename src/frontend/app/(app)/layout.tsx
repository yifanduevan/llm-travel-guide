import Link from "next/link";
import { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/trips" className="text-lg font-semibold text-slate-900">
            Trip Planner
          </Link>
          <nav className="flex gap-3 text-sm font-medium text-slate-700">
            <Link
              href="/trips"
              className="rounded-md px-3 py-2 transition hover:bg-slate-100"
            >
              Trips
            </Link>
            <Link
              href="/trips/add"
              className="rounded-md px-3 py-2 transition hover:bg-slate-100"
            >
              Add trip
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
