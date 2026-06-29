import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/sent")({
  component: SentPage,
});

interface Gift {
  id: string;
  recipient_id: string;
  track_name: string;
  artist_name: string;
  artwork_url: string | null;
  note: string | null;
  created_at: string;
}
interface Profile {
  id: string;
  display_name: string;
}

function SentPage() {
  const { user } = Route.useRouteContext();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("gifts")
        .select("id,recipient_id,track_name,artist_name,artwork_url,note,created_at")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });
      const list = (data as Gift[] | null) ?? [];
      setGifts(list);
      const ids = Array.from(new Set(list.map((g) => g.recipient_id)));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id,display_name")
          .in("id", ids);
        const map: Record<string, Profile> = {};
        (profs ?? []).forEach((p) => {
          map[p.id] = p as Profile;
        });
        setProfiles(map);
      }
      setLoading(false);
    })();
  }, [user.id]);

  return (
    <div className="mx-auto max-w-md px-6 pt-12">
      <header className="mb-10">
        <h1 className="font-serif text-4xl">Sent</h1>
        <p className="mt-2 text-sm italic text-muted-foreground">The songs you've passed along.</p>
      </header>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : gifts.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-6 py-12 text-center">
          <p className="font-serif text-xl">Nothing sent yet.</p>
          <Link
            to="/friends"
            className="mt-6 inline-block text-xs uppercase tracking-[0.18em] text-accent"
          >
            Send a song
          </Link>
        </div>
      ) : (
        <ul className="space-y-5">
          {gifts.map((g) => (
            <li key={g.id} className="rounded-md border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
                to{" "}
                <span className="text-foreground">
                  {profiles[g.recipient_id]?.display_name ?? "a friend"}
                </span>
                <span className="mx-2 text-muted-foreground/60">·</span>
                {timeAgo(g.created_at)}
              </p>
              <div className="flex items-center gap-4">
                {g.artwork_url && (
                  <img src={g.artwork_url} alt="" className="h-14 w-14 rounded-sm" />
                )}
                <div className="min-w-0">
                  <p className="font-serif text-lg truncate">{g.track_name}</p>
                  <p className="text-sm text-muted-foreground truncate">{g.artist_name}</p>
                </div>
              </div>
              {g.note && (
                <p className="mt-3 font-serif italic text-foreground/70 text-sm">{`"${g.note}"`}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
