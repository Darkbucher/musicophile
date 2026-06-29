import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/friends")({
  component: FriendsPage,
});

interface Profile { id: string; display_name: string; avatar_url: string | null; }
interface Friendship { id: string; requester_id: string; addressee_id: string; status: "pending" | "accepted"; }

function FriendsPage() {
  const { user } = Route.useRouteContext();
  const [me, setMe] = useState<Profile | null>(null);
  const [myCode, setMyCode] = useState<string | null>(null);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [unreadBy, setUnreadBy] = useState<Record<string, number>>({});
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    const { data: myProf } = await supabase.from("profiles").select("id,display_name,avatar_url").eq("id", user.id).maybeSingle();
    setMe(myProf as Profile | null);
    const { data: codeRow } = await supabase.from("invite_codes").select("code").eq("user_id", user.id).maybeSingle();
    setMyCode((codeRow as { code: string } | null)?.code ?? null);
    const { data: fs } = await supabase
      .from("friendships").select("*")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
    setFriendships((fs as Friendship[] | null) ?? []);

    const ids = new Set<string>();
    (fs ?? []).forEach((f) => { ids.add(f.requester_id); ids.add(f.addressee_id); });
    ids.delete(user.id);
    if (ids.size) {
      const { data: profs } = await supabase.from("profiles").select("id,display_name,avatar_url").in("id", Array.from(ids));
      const map: Record<string, Profile> = {};
      (profs ?? []).forEach((p) => { map[p.id] = p as Profile; });
      setProfiles(map);
    }

    const { data: unreads } = await supabase
      .from("gifts").select("sender_id")
      .eq("recipient_id", user.id).is("read_at", null);
    const counts: Record<string, number> = {};
    (unreads ?? []).forEach((g: { sender_id: string }) => {
      counts[g.sender_id] = (counts[g.sender_id] ?? 0) + 1;
    });
    setUnreadBy(counts);
  }

  useEffect(() => { load(); }, [user.id]);

  async function addFriend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const c = code.trim().toLowerCase();
    if (!c) return;
    const { data: targetId, error: rpcErr } = await supabase.rpc("find_user_by_invite_code", { _code: c });
    if (rpcErr) { setError(rpcErr.message); return; }
    if (!targetId) { setError("No one with that code."); return; }
    if (targetId === user.id) { setError("That's your own code."); return; }
    const { error: insertErr } = await supabase.from("friendships").insert({
      requester_id: user.id, addressee_id: targetId, status: "pending",
    });
    if (insertErr) {
      setError(insertErr.code === "23505" ? "You're already connected (or a request is pending)." : insertErr.message);
      return;
    }
    setCode("");
    load();
  }

  async function accept(f: Friendship) {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", f.id);
    load();
  }
  async function remove(f: Friendship) {
    await supabase.from("friendships").delete().eq("id", f.id);
    load();
  }

  function copyCode() {
    if (!myCode) return;
    navigator.clipboard?.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const accepted = friendships.filter((f) => f.status === "accepted");
  const incoming = friendships.filter((f) => f.status === "pending" && f.addressee_id === user.id);
  const outgoing = friendships.filter((f) => f.status === "pending" && f.requester_id === user.id);

  return (
    <div className="mx-auto max-w-md px-6 pt-12">
      <header className="mb-10">
        <h1 className="font-serif text-4xl">Friends</h1>
        <p className="mt-2 text-sm italic text-muted-foreground">A small, intentional circle.</p>
      </header>

      <section className="mb-8 rounded-md border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your invite code</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-serif text-3xl tracking-[0.2em]">{myCode ?? "…"}</p>
          <button onClick={copyCode} className="text-xs uppercase tracking-[0.18em] text-accent">
            {copied ? "copied" : "copy"}
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Share it with one person.</p>
      </section>

      <form onSubmit={addFriend} className="mb-8 flex gap-2">
        <input
          placeholder="Enter a friend's code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <button className="rounded-md bg-primary px-4 py-3 text-sm text-primary-foreground">Send</button>
      </form>
      {error && <p className="text-sm text-destructive mb-6">{error}</p>}

      {incoming.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Requests</h2>
          <ul className="space-y-3">
            {incoming.map((f) => (
              <li key={f.id} className="flex items-center justify-between border-b border-border pb-3">
                <span className="font-serif text-lg">{profiles[f.requester_id]?.display_name ?? "Someone"}</span>
                <div className="flex gap-4">
                  <button onClick={() => accept(f)} className="text-xs uppercase tracking-[0.18em] text-accent">accept</button>
                  <button onClick={() => remove(f)} className="text-xs uppercase tracking-[0.18em] text-muted-foreground">decline</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Your circle</h2>
        {accepted.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">No one yet.</p>
        ) : (
          <ul className="space-y-3">
            {accepted.map((f) => {
              const otherId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
              const p = profiles[otherId];
              const unread = unreadBy[otherId] ?? 0;
              return (
                <li key={f.id}>
                  <Link
                    to="/friends/$friendId"
                    params={{ friendId: otherId }}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-4 transition-colors hover:border-accent"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-serif text-foreground">
                        {p?.display_name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                      <span className="font-serif text-lg truncate">{p?.display_name ?? "Friend"}</span>
                    </span>
                    <span className="flex items-center gap-3 shrink-0">
                      {unread > 0 && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent-foreground">
                          {unread} new
                        </span>
                      )}
                      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">open</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {outgoing.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Awaiting reply</h2>
          <ul className="space-y-2">
            {outgoing.map((f) => (
              <li key={f.id} className="text-sm text-muted-foreground italic">
                {profiles[f.addressee_id]?.display_name ?? "…"} — pending
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
