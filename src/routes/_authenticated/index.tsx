import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/")({
  component: InboxPage,
});

interface Gift {
  id: string;
  sender_id: string;
  track_name: string;
  artist_name: string;
  artwork_url: string | null;
  note: string | null;
  youtube_video_id: string | null;
  created_at: string;
  read_at: string | null;
}
interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

function InboxPage() {
  const { user } = Route.useRouteContext();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("gifts")
      .select(
        "id,sender_id,track_name,artist_name,artwork_url,note,youtube_video_id,created_at,read_at",
      )
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });
    const list = (data as Gift[] | null) ?? [];
    setGifts(list);
    const ids = Array.from(new Set(list.map((g) => g.sender_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,display_name,avatar_url")
        .in("id", ids);
      const map: Record<string, Profile> = {};
      (profs ?? []).forEach((p) => {
        map[p.id] = p as Profile;
      });
      setProfiles(map);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const ch = supabase
      .channel(`inbox-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gifts", filter: `recipient_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user.id]);

  return (
    <div className="mx-auto max-w-md px-6 pt-12">
      <header className="mb-10">
        <h1 className="font-serif text-4xl">Inbox</h1>
        <p className="mt-2 text-sm italic text-muted-foreground">
          Songs sent to you, like letters.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-muted-foreground">Opening the mailbox…</p>
      ) : gifts.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-6 py-12 text-center">
          <p className="font-serif text-xl text-foreground">No songs yet.</p>
          <p className="mt-2 text-sm text-muted-foreground italic">
            When a friend sends you one, it'll land here.
          </p>
          <Link
            to="/friends"
            className="mt-6 inline-block text-xs uppercase tracking-[0.18em] text-accent"
          >
            Find a friend
          </Link>
        </div>
      ) : (
        <ul className="space-y-5">
          {gifts.map((g) => {
            const sender = profiles[g.sender_id];
            const unread = !g.read_at;
            return (
              <li key={g.id}>
                <Link
                  to="/gift/$id"
                  params={{ id: g.id }}
                  className="block rounded-md border border-border bg-card p-5 transition-colors hover:border-accent"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      from{" "}
                      <span className="text-foreground">{sender?.display_name ?? "a friend"}</span>
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {unread && (
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                          aria-label="unread"
                        />
                      )}
                      <span className="text-xs text-muted-foreground">{timeAgo(g.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {g.artwork_url && (
                      <img src={g.artwork_url} alt="" className="h-16 w-16 rounded-sm shadow-sm" />
                    )}
                    <div className="min-w-0">
                      <p className="font-serif text-lg leading-snug truncate">{g.track_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{g.artist_name}</p>
                    </div>
                  </div>
                  {g.note && (
                    <p className="mt-4 border-t border-border pt-3 font-serif italic text-foreground/80">
                      {`"${g.note}"`}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
