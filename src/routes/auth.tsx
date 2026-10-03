import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  const [mode, setMode] = useState<"sign-in" | "sign-up" | "magic">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  // Automatically redirect when user signs in via email magic link
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate({ to: "/" });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setMagicSent(true);
        return;
      }

      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() || email.split("@")[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setEmailSent(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (magicSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-serif text-5xl text-foreground">Musicophile</h1>
          <p className="mt-8 font-serif text-2xl text-foreground">Check your email.</p>
          <p className="mt-3 text-sm text-muted-foreground italic leading-relaxed">
            We sent a direct login link to{" "}
            <span className="text-foreground font-medium">{email}</span>. Open your Gmail or inbox
            and tap the link to log in instantly without a password.
          </p>
          <button
            type="button"
            className="mt-8 text-xs uppercase tracking-[0.18em] text-accent hover:underline"
            onClick={() => {
              setMagicSent(false);
              setMode("sign-in");
            }}
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-serif text-5xl text-foreground">Musicophile</h1>
          <p className="mt-8 font-serif text-2xl text-foreground">Check your inbox.</p>
          <p className="mt-3 text-sm text-muted-foreground italic leading-relaxed">
            We sent a confirmation link to{" "}
            <span className="text-foreground font-medium">{email}</span>. Click it to finish
            creating your account.
          </p>
          <button
            type="button"
            className="mt-8 text-xs uppercase tracking-[0.18em] text-accent hover:underline"
            onClick={() => setEmailSent(false)}
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-5xl text-foreground">Musicophile</h1>
          <p className="mt-3 text-sm text-muted-foreground italic">
            {mode === "magic" ? "Sign in with direct email link" : "One song, every day."}
          </p>
        </div>

        {mode === "magic" && (
          <p className="mb-5 text-center text-xs text-muted-foreground leading-relaxed">
            Forgot your password? Enter your email address and we will send a direct login link
            straight to your inbox.
          </p>
        )}

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
            placeholder="Email / Gmail address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />

          {mode !== "magic" && (
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent"
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-3 text-sm tracking-wide text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "…"
              : mode === "sign-in"
                ? "Sign in"
                : mode === "sign-up"
                  ? "Begin"
                  : "Send direct login link"}
          </button>
        </form>

        {mode === "sign-in" && (
          <p className="mt-3 text-center">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-accent underline underline-offset-4 transition-colors"
              onClick={() => {
                setMode("magic");
                setError(null);
              }}
            >
              Forgot password? Log in without password
            </button>
          </p>
        )}

        {mode === "magic" && (
          <p className="mt-4 text-center">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-accent underline underline-offset-4 transition-colors"
              onClick={() => {
                setMode("sign-in");
                setError(null);
              }}
            >
              Remember your password? Sign in with password
            </button>
          </p>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {mode === "sign-in" || mode === "magic" ? "New here? " : "Already have an account? "}
          <button
            type="button"
            className="text-accent underline underline-offset-4"
            onClick={() => {
              setMode(mode === "sign-up" ? "sign-in" : "sign-up");
              setError(null);
            }}
          >
            {mode === "sign-up" ? "Sign in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}
