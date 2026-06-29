import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fullDate } from "@/lib/format";
import { youtubeSearchUrl } from "@/lib/youtube";
import { useTheme } from "@/lib/theme";
import { FlowerRevealPetals } from "@/components/ThemeBackground";

export const Route = createFileRoute("/_authenticated/gift/$id")({
  component: GiftDetailPage,
});

interface Gift {
  id: string;
  sender_id: string;
  recipient_id: string;
  track_name: string;
  artist_name: string;
  artwork_url: string | null;
  note: string | null;
  youtube_url: string | null;
  youtube_video_id: string | null;
  created_at: string;
  read_at: string | null;
}
interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

function GiftDetailPage() {
  const { user } = Route.useRouteContext();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [gift, setGift] = useState<Gift | null>(null);
  const [sender, setSender] = useState<Profile | null>(null);
  const [recipient, setRecipient] = useState<Profile | null>(null);
  const [opened, setOpened] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("gifts").select("*").eq("id", id).maybeSingle();
      if (!data) {
        setNotFound(true);
        return;
      }
      const g = data as Gift;
      setGift(g);
      const otherIds = Array.from(new Set([g.sender_id, g.recipient_id]));
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,display_name,avatar_url")
        .in("id", otherIds);
      (profs ?? []).forEach((p) => {
        if (p.id === g.sender_id) setSender(p as Profile);
        if (p.id === g.recipient_id) setRecipient(p as Profile);
      });
      // If recipient and unread, mark when they open the envelope
      const youAreRecipient = g.recipient_id === user.id;
      setOpened(!youAreRecipient || !!g.read_at);
    })();
  }, [id, user.id]);

  async function openEnvelope() {
    if (!gift) return;
    setReveal(true);
    setTimeout(() => setOpened(true), 700);
    if (gift.recipient_id === user.id && !gift.read_at) {
      await supabase.from("gifts").update({ read_at: new Date().toISOString() }).eq("id", gift.id);
    }
  }

  async function deleteGift() {
    if (!gift) return;
    if (!confirm("Delete this gift?")) return;
    await supabase.from("gifts").delete().eq("id", gift.id);
    navigate({ to: mine ? "/sent" : "/" });
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-md px-6 pt-12 text-center">
        <p className="font-serif text-xl text-foreground">Song not found.</p>
        <p className="mt-2 text-sm text-muted-foreground italic">
          It may have been deleted or you don't have access.
        </p>
        <Link to="/" className="mt-6 inline-block text-xs uppercase tracking-[0.18em] text-accent">
          ← inbox
        </Link>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="mx-auto max-w-md px-6 pt-12 text-sm text-muted-foreground">Loading…</div>
    );
  }

  const mine = gift.sender_id === user.id;
  const fromName = mine ? "You" : (sender?.display_name ?? "A friend");
  const toName = mine ? (recipient?.display_name ?? "your friend") : "you";

  if (!opened) {
    return (
      <div className="mx-auto max-w-md px-6 pt-16 text-center">
        <Link
          to="/"
          className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          ← inbox
        </Link>
        <div className="mt-14 [perspective:900px]">
          {/* Envelope body */}
          <div
            className={`mx-auto relative w-60 h-40 rounded-md border border-border bg-card overflow-hidden ${reveal ? "" : "animate-envelope-pulse"}`}
          >
            {/* Letter peeking up from inside */}
            {reveal && (
              <div className="absolute inset-x-4 bottom-2 top-10 rounded-sm border border-border bg-background animate-letter-rise flex items-center justify-center px-3">
                <span className="font-serif italic text-sm text-foreground/75">a song for you</span>
              </div>
            )}
            {/* Flap — flips open on reveal */}
            <div
              className={`absolute inset-x-0 top-0 h-24 origin-top bg-secondary ${reveal ? "animate-flap-open" : ""}`}
              style={{ clipPath: "polygon(0 0, 50% 85%, 100% 0)" }}
            />
            {/* Sender label, fades out when opening */}
            {!reveal && (
              <div className="absolute inset-0 flex items-end justify-center pb-4">
                <span className="font-serif italic text-sm text-foreground/70">
                  from {sender?.display_name ?? "a friend"}
                </span>
              </div>
            )}
          </div>
          <p className="mt-10 font-serif text-2xl text-foreground">You've received a song.</p>
          <p className="mt-2 text-sm italic text-muted-foreground">Take a quiet moment.</p>
          <button
            onClick={openEnvelope}
            disabled={reveal}
            className="mt-8 rounded-md bg-primary px-8 py-3 text-sm uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
          >
            {reveal ? "Opening…" : "Open"}
          </button>
        </div>
        {reveal && theme === "flower" && <FlowerRevealPetals />}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 pt-10 animate-gift-reveal">
      <Link
        to={mine ? "/sent" : "/"}
        className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        ← back
      </Link>

      <header className="mt-8 mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {fromName} → {toName}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{fullDate(gift.created_at)}</p>
      </header>

      {gift.artwork_url && (
        <img
          src={gift.artwork_url}
          alt=""
          className="mx-auto mb-8 h-56 w-56 rounded-sm shadow-md"
        />
      )}

      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl leading-tight">{gift.track_name}</h1>
        <p className="mt-2 text-base text-muted-foreground">{gift.artist_name}</p>
      </div>

      {gift.note && (
        <blockquote className="mb-10 border-l-2 border-accent pl-5 font-handwriting text-3xl text-foreground/90">
          {`"${gift.note}"`}
          <footer className="mt-2 text-xs not-italic uppercase tracking-[0.18em] text-muted-foreground">
            — {sender?.display_name ?? "them"}
          </footer>
        </blockquote>
      )}

      {gift.youtube_video_id ? (
        <div className="mb-10">
          <div
            className="relative w-full overflow-hidden rounded-md border border-border bg-black"
            style={{ paddingTop: "56.25%" }}
          >
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${gift.youtube_video_id}?rel=0`}
              title={`${gift.track_name} — ${gift.artist_name}`}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="mb-10 rounded-md border border-dashed border-border p-5 text-center">
          <p className="text-sm italic text-muted-foreground">
            No video was attached to this song.
          </p>
          <a
            href={youtubeSearchUrl(gift.track_name, gift.artist_name)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs uppercase tracking-[0.18em] text-accent"
          >
            Find it on YouTube ↗
          </a>
        </div>
      )}

      {mine && (
        <button
          onClick={deleteGift}
          className="mt-4 w-full text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-destructive"
        >
          delete this gift
        </button>
      )}
    </div>
  );
}
