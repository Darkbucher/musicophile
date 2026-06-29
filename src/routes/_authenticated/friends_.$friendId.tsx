import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { searchITunes, upgradeArtwork, type ITunesTrack } from "@/lib/itunes";
import { extractYouTubeId, youtubeSearchUrl } from "@/lib/youtube";
import { timeAgo, fullDate } from "@/lib/format";
import { findYouTubeMatch } from "@/lib/youtube-search.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_authenticated/friends_/$friendId")({
  component: FriendThreadPage,
});

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
}
interface Gift {
  id: string;
  sender_id: string;
  recipient_id: string;
  track_name: string;
  artist_name: string;
  artwork_url: string | null;
  note: string | null;
  youtube_video_id: string | null;
  created_at: string;
  read_at: string | null;
}

function FriendThreadPage() {
  const { user } = Route.useRouteContext();
  const { friendId } = Route.useParams();
  const [friend, setFriend] = useState<Profile | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);

  async function load() {
    const { data: prof } = await supabase
      .from("profiles")
      .select("id,display_name,avatar_url")
      .eq("id", friendId)
      .maybeSingle();
    setFriend(prof as Profile | null);
    const { data: fs } = await supabase
      .from("friendships")
      .select("status")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`,
      )
      .maybeSingle();
    setAllowed(fs?.status === "accepted");

    const { data } = await supabase
      .from("gifts")
      .select(
        "id,sender_id,recipient_id,track_name,artist_name,artwork_url,note,youtube_video_id,created_at,read_at",
      )
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: false });
    setGifts((data as Gift[] | null) ?? []);
  }

  useEffect(() => {
    load();
    const involvesThread = (
      row: { sender_id?: string; recipient_id?: string } | null | undefined,
    ) => {
      if (!row) return false;
      return (
        (row.sender_id === user.id && row.recipient_id === friendId) ||
        (row.sender_id === friendId && row.recipient_id === user.id)
      );
    };
    const ch = supabase
      .channel(`thread-${user.id}-${friendId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "gifts" }, (payload) => {
        const next = (payload.new ?? null) as Partial<Gift> | null;
        const prev = (payload.old ?? null) as Partial<Gift> | null;
        if (involvesThread(next) || involvesThread(prev)) load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user.id, friendId]);

  return (
    <div className="mx-auto max-w-md px-6 pt-10">
      <Link
        to="/friends"
        className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        ← friends
      </Link>

      <header className="mt-6 mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Between you and</p>
        <h1 className="font-serif text-4xl mt-1">{friend?.display_name ?? "…"}</h1>
        <p className="mt-2 text-sm italic text-muted-foreground">
          {gifts.length === 0
            ? "No songs yet."
            : `${gifts.length} song${gifts.length === 1 ? "" : "s"} shared.`}
        </p>
      </header>

      {allowed && (
        <button
          onClick={() => setComposerOpen(true)}
          className="w-full mb-10 rounded-md bg-primary py-4 font-serif text-lg text-primary-foreground"
        >
          Send a song
        </button>
      )}

      <ol className="space-y-6 border-l border-border pl-5">
        {gifts.map((g) => {
          const mine = g.sender_id === user.id;
          return (
            <li key={g.id} className="relative">
              <span
                className={`absolute -left-[26px] top-2 inline-block h-2 w-2 rounded-full ${mine ? "bg-muted-foreground/50" : "bg-accent"}`}
              />
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                {mine ? "you sent" : `${friend?.display_name ?? "they"} sent`}
                <span className="mx-2 text-muted-foreground/60">·</span>
                <span title={fullDate(g.created_at)}>{timeAgo(g.created_at)}</span>
              </div>
              <Link
                to="/gift/$id"
                params={{ id: g.id }}
                className="block rounded-md border border-border bg-card p-4 hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  {g.artwork_url && (
                    <img src={g.artwork_url} alt="" className="h-14 w-14 rounded-sm" />
                  )}
                  <div className="min-w-0">
                    <p className="font-serif text-lg truncate">{g.track_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{g.artist_name}</p>
                  </div>
                </div>
                {g.note && (
                  <p className="mt-3 font-serif italic text-foreground/80 text-sm">{`"${g.note}"`}</p>
                )}
              </Link>
            </li>
          );
        })}
      </ol>

      {composerOpen && friend && (
        <Composer
          friend={friend}
          onClose={() => setComposerOpen(false)}
          onSent={() => {
            setComposerOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function Composer({
  friend,
  onClose,
  onSent,
}: {
  friend: Profile;
  onClose: () => void;
  onSent: () => void;
}) {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const ytSearch = useServerFn(findYouTubeMatch);

  const [mode, setMode] = useState<"search" | "manual">("search");
  // Search mode state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ITunesTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [picked, setPicked] = useState<ITunesTrack | null>(null);
  // Manual mode state
  const [manualTrack, setManualTrack] = useState("");
  const [manualArtist, setManualArtist] = useState("");

  const [youtubeInput, setYoutubeInput] = useState("");
  const [autoMatched, setAutoMatched] = useState(false);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced iTunes search
  useEffect(() => {
    if (mode !== "search" || picked) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const r = await searchITunes(q, 8);
        if (!cancelled) {
          setResults(r);
          setSearched(true);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setSearched(true);
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, mode, picked]);

  async function pickTrack(t: ITunesTrack) {
    setPicked(t);
    setResults([]);
    setYtError(null);
    setYoutubeInput("");
    setAutoMatched(false);
    setYtLoading(true);
    try {
      const res = await ytSearch({ data: { query: `${t.trackName} ${t.artistName}` } });
      if (res.ok) {
        setYoutubeInput(`https://www.youtube.com/watch?v=${res.result.videoId}`);
        setAutoMatched(true);
      } else {
        setYtError(res.error);
      }
    } catch {
      setYtError("Could not reach YouTube.");
    } finally {
      setYtLoading(false);
    }
  }

  function clearPick() {
    setPicked(null);
    setYoutubeInput("");
    setAutoMatched(false);
    setYtError(null);
  }

  const youtubeId = extractYouTubeId(youtubeInput);
  const youtubeBad = youtubeInput.trim().length > 0 && !youtubeId;

  const effectiveTrack = mode === "search" ? (picked?.trackName ?? "") : manualTrack.trim();
  const effectiveArtist = mode === "search" ? (picked?.artistName ?? "") : manualArtist.trim();
  const effectiveArtwork =
    mode === "search" ? (upgradeArtwork(picked?.artworkUrl100, 600) ?? null) : null;
  const canSend = effectiveTrack.length > 0 && !!youtubeId && !sending;

  async function send() {
    if (!canSend) return;
    setSending(true);
    setError(null);
    const { data, error: insErr } = await supabase
      .from("gifts")
      .insert({
        sender_id: user.id,
        recipient_id: friend.id,
        track_id: picked?.trackId ? String(picked.trackId) : null,
        track_name: effectiveTrack,
        artist_name: effectiveArtist || "Unknown artist",
        artwork_url: effectiveArtwork,
        youtube_url: youtubeInput.trim() || null,
        youtube_video_id: youtubeId,
        note: note.trim() || null,
      })
      .select("id")
      .single();
    setSending(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    onSent();
    if (data?.id) navigate({ to: "/gift/$id", params: { id: data.id } });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 px-4 py-10 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-md border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl">For {friend.display_name}</h2>
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
          >
            close
          </button>
        </div>

        {mode === "search" ? (
          <>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
              1. Song
            </p>

            {!picked ? (
              <>
                <input
                  placeholder="Song name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent mb-3"
                />
                {searching && (
                  <p className="text-xs italic text-muted-foreground mb-2">Searching…</p>
                )}
                {!searching && searched && results.length === 0 && (
                  <p className="text-xs italic text-muted-foreground mb-2">
                    No matches — try a different search.
                  </p>
                )}
                <ul className="max-h-72 space-y-2 overflow-y-auto">
                  {results.map((t) => (
                    <li key={String(t.trackId) + t.trackName}>
                      <button
                        type="button"
                        onClick={() => pickTrack(t)}
                        className="flex w-full items-center gap-3 rounded-md border border-border/60 bg-background/40 p-2 text-left hover:border-accent transition-colors"
                      >
                        {t.artworkUrl100 && (
                          <img src={t.artworkUrl100} alt="" className="h-10 w-10 rounded-sm" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif truncate">{t.trackName}</span>
                          <span className="block truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            {t.artistName}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    setMode("manual");
                    setManualTrack(query);
                  }}
                  className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-accent"
                >
                  Enter manually instead
                </button>
              </>
            ) : (
              <div className="mb-5 flex items-center gap-3 rounded-md border border-accent/60 bg-background/40 p-3">
                {picked.artworkUrl100 && (
                  <img src={picked.artworkUrl100} alt="" className="h-12 w-12 rounded-sm" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-serif truncate">{picked.trackName}</p>
                  <p className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {picked.artistName}
                  </p>
                </div>
                <button
                  onClick={clearPick}
                  className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-accent"
                >
                  ✕ change
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                1. Song (manual)
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode("search");
                  setManualTrack("");
                  setManualArtist("");
                }}
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-accent"
              >
                ← back to search
              </button>
            </div>
            <input
              placeholder="Song name"
              value={manualTrack}
              onChange={(e) => setManualTrack(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent mb-2"
            />
            <input
              placeholder="Artist"
              value={manualArtist}
              onChange={(e) => setManualArtist(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent mb-5"
            />
          </>
        )}

        {(picked || mode === "manual") && (
          <>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
              2. YouTube link
              {autoMatched && (
                <span className="ml-2 normal-case tracking-normal text-[10px] text-accent">
                  auto-matched, tap to change
                </span>
              )}
              {ytLoading && (
                <span className="ml-2 normal-case tracking-normal text-[10px] text-muted-foreground">
                  searching YouTube…
                </span>
              )}
            </label>
            <input
              placeholder="https://youtube.com/watch?v=…"
              value={youtubeInput}
              onChange={(e) => {
                setYoutubeInput(e.target.value);
                setAutoMatched(false);
              }}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent mb-1"
            />
            {youtubeBad && (
              <p className="text-xs text-destructive mb-2">
                That doesn't look like a YouTube link.
              </p>
            )}
            {ytError && !youtubeInput && (
              <a
                href={
                  picked
                    ? youtubeSearchUrl(picked.trackName, picked.artistName)
                    : "https://youtube.com"
                }
                target="_blank"
                rel="noreferrer"
                className="mb-2 inline-block text-xs text-accent underline-offset-4 hover:underline"
              >
                {ytError} Search YouTube ↗
              </a>
            )}

            {youtubeId && (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="group relative mb-5 mt-2 block w-full overflow-hidden rounded-md border border-border bg-black"
              >
                <img
                  src={`https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`}
                  alt="Video preview"
                  className="aspect-video w-full object-cover opacity-90 group-hover:opacity-100"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 text-foreground">
                    ▶
                  </span>
                </span>
                <span className="absolute bottom-2 left-2 right-2 truncate text-left text-[10px] uppercase tracking-[0.18em] text-white/90">
                  preview — tap to play
                </span>
              </button>
            )}

            <label className="mt-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
              3. A line{" "}
              <span className="text-muted-foreground/70 normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <textarea
              placeholder="this reminded me of…"
              value={note}
              maxLength={200}
              rows={3}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent mb-1 font-serif italic"
            />
            <p className="mb-5 text-right text-xs text-muted-foreground">{note.length}/200</p>

            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
            <button
              onClick={send}
              disabled={!canSend}
              className="w-full rounded-md bg-primary py-3 text-sm text-primary-foreground disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </>
        )}

        {previewOpen && youtubeId && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/70 px-4"
            onClick={() => setPreviewOpen(false)}
          >
            <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div
                className="relative w-full overflow-hidden rounded-md border border-border bg-black"
                style={{ paddingTop: "56.25%" }}
              >
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  title="Preview"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="mt-3 w-full text-center text-xs uppercase tracking-[0.18em] text-white/80"
              >
                close preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
