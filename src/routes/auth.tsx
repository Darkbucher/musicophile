import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split("@")[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        // If identities is empty, email confirmation is required before the
        // user is fully signed in — show a prompt instead of navigating.
        if (!data.session) {
          setEmailSent(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-serif text-5xl text-foreground">Musicophile</h1>
          <p className="mt-8 font-serif text-xl text-foreground">Check your inbox.</p>
          <p className="mt-3 text-sm text-muted-foreground italic">
            We sent a confirmation link to <span className="text-foreground">{email}</span>. Click
            it to finish creating your account.
          </p>
          <button
            type="button"
            className="mt-8 text-xs uppercase tracking-[0.18em] text-accent"
            onClick={() => setEmailSent(false)}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-5xl text-foreground">Musicophile</h1>
          <p className="mt-3 text-sm text-muted-foreground italic">One song, every day.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "sign-up" && (
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent"
            />
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-3 text-sm tracking-wide text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "…" : mode === "sign-in" ? "Sign in" : "Begin"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {mode === "sign-in" ? "New here? " : "Already have an account? "}
          <button
            type="button"
            className="text-accent underline underline-offset-4"
            onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          >
            {mode === "sign-in" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
