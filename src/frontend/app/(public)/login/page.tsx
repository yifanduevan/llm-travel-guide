"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Placeholder auth: set a simple cookie so middleware can allow access.
    document.cookie = "auth=1; path=/";
    router.push("/trips");
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-sm font-semibold uppercase text-slate-500">Login</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back
        </h1>
        <p className="text-sm text-slate-600">
          Use any credentials for now — this sets a demo cookie to unlock trips.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-left text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            required
          />
        </label>
        <label className="block space-y-2 text-left text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            required
          />
        </label>
        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
        >
          Sign in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Want to jump in?{" "}
        <Link href="/" className="text-slate-900 underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
