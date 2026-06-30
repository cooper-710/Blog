"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(error.message);
        return;
      }

      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md border border-stone bg-paper p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Admin access</p>
      <h1 className="mt-3 font-serif text-4xl text-ink">Sign in</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-charcoal">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="focus-ring mt-2 w-full border border-stone bg-ivory px-3 py-3"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-charcoal">Password</span>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="focus-ring mt-2 w-full border border-stone bg-ivory px-3 py-3"
          />
        </label>
        {message && <p className="border border-stone bg-ivory p-3 text-sm leading-6 text-charcoal/75">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="focus-ring w-full rounded-sm bg-ink px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-clay disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
