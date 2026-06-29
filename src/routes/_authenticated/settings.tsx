import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { THEMES, useTheme } from "@/lib/theme";


export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

interface Profile { id: string; display_name: string; avatar_url: string | null; }

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("id,display_name,avatar_url").eq("id", user.id).maybeSingle();
      if (data) {
        const p = data as Profile;
        setProfile(p);
        setDisplayName(p.display_name);
        setAvatarUrl(p.avatar_url ?? "");
      }
      const { data: codeRow } = await supabase.from("invite_codes").select("code").eq("user_id", user.id).maybeSingle();
      setInviteCode((codeRow as { code: string } | null)?.code ?? null);
    })();
  }, [user.id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("profiles").update({
      display_name: displayName.trim() || "Listener",
      avatar_url: avatarUrl.trim() || null,
    }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="mx-auto max-w-md px-6 pt-12">
      <header className="mb-10">
        <h1 className="font-serif text-4xl">Settings</h1>
      </header>

      <form onSubmit={save} className="mb-12 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Avatar URL</label>
          <input
            placeholder="https://…"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <button disabled={saving} className="rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-50">
          {saving ? "Saving…" : saved ? "Saved" : "Save"}
        </button>
      </form>

      <section className="mb-12 rounded-md border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your invite code</p>
        <p className="mt-2 font-serif text-2xl tracking-[0.2em]">{inviteCode ?? "…"}</p>
        <p className="mt-2 text-xs text-muted-foreground">Share it with someone to connect.</p>
      </section>

      <section className="mb-12">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Theme</p>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => {
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`rounded-md border px-3 py-3 text-left transition-colors ${active ? "border-accent bg-card" : "border-border bg-card/60 hover:border-accent"}`}
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden className="text-base">{t.emoji}</span>
                  <span className="font-serif text-lg">{t.label}</span>
                </div>
                <p className="mt-1 text-xs italic text-muted-foreground">{t.blurb}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <button onClick={signOut} className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-destructive">
          Sign out
        </button>
      </section>
    </div>
  );
}
