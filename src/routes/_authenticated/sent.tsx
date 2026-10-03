import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo, fullDate } from "@/lib/format";
import { getReaction } from "@/lib/reactions";

export const Route = createFileRoute("/_authenticated/sent")({
  component: SentPage,
});

interface Gift {
  id: string;
  recipient_id: string;
  track_id: string | null;
  track_name: string;
  artist_name: string;
  artwork_url: string | null;
  note: string | null;
  created_at: string;
  read_at: string | null;
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
        .select(
          "id,recipient_id,track_id,track_name,artist_name,artwork_url,note,created_at,read_at",
        )
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
        <p className="mt-2 text-sm italic text-muted-foreground">
          The songs you&apos;ve passed along.
        </p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-md border border-border bg-card p-5 animate-pulse">
              <div className="h-3 w-32 rounded bg-muted mb-4" />
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-sm bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : gifts.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-6 py-12 text-center">
          <p className="font-serif text-xl">You haven&apos;t sent a song yet.</p>
          <p className="mt-2 text-sm italic text-muted-foreground">
            Find a friend and send them something that makes you think of them.
          </p>
          <Link
            to="/friends"
            className="mt-6 inline-block text-xs uppercase tracking-[0.18em] text-accent"
          >
            Go to Friends
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {gifts.map((g) => {
            const reaction = getReaction(g.track_id);
            const friendName = profiles[g.recipient_id]?.display_name ?? "a friend";

            return (
              <li key={g.id}>
                <Link
                  to="/gift/$id"
                  params={{ id: g.id }}
                  className="block rounded-md border border-border bg-card p-5 transition-colors hover:border-accent"
                >
                  {/* Header row: recipient + timestamp + read receipt */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      to <span className="text-foreground">{friendName}</span>
                      <span className="mx-2 text-muted-foreground/60">·</span>
                      {timeAgo(g.created_at)}
                    </p>

                    {/* Read receipt badge */}
                    {g.read_at ? (
                      <span
                        title={`Opened ${fullDate(g.read_at)}`}
                        className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-accent font-medium flex items-center gap-1"
                      >
                        <span aria-hidden>✓</span> opened {timeAgo(g.read_at)}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                        delivered
                      </span>
                    )}
                  </div>

                  {/* Track row */}
                  <div className="flex items-center gap-4">
                    {g.artwork_url && (
                      <img
                        src={g.artwork_url}
                        alt=""
                        loading="lazy"
                        className="h-14 w-14 rounded-sm shrink-0 object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-lg truncate">{g.track_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{g.artist_name}</p>
                    </div>

                    {/* Emoji Reaction Pill if present */}
                    {reaction && (
                      <span
                        className="shrink-0 text-2xl bg-background/80 border border-border rounded-full px-2.5 py-1 shadow-sm leading-none"
                        title={`${friendName} reacted with ${reaction}`}
                      >
                        {reaction}
                      </span>
                    )}
                  </div>

                  {/* Note */}
                  {g.note && (
                    <p className="mt-3 font-handwriting text-2xl text-foreground/85 border-t border-border pt-3">
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
