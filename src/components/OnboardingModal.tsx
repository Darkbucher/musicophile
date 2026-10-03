import { useState, useEffect } from "react";

const STORAGE_KEY = "musicophile-onboarded";

const STEPS = [
  {
    emoji: "💌",
    title: "Songs like letters.",
    body: "Musicophile lets you send a single song to a friend — with a personal note attached. No feed, no likes. Just one song, one person, one moment.",
  },
  {
    emoji: "🔑",
    title: "Connect with your code.",
    body: 'Every account has a unique invite code. Share yours with a friend, or enter theirs in the Friends tab to connect. It\'s intentionally small — a "small, intentional circle."',
  },
  {
    emoji: "🎁",
    title: "Gifts arrive as surprises.",
    body: "When a friend sends you a song, it lands in your Inbox sealed — you only discover what it is when you choose to open it. Take a quiet moment.",
  },
];

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) setOpen(true);
    } catch {
      // ignore
    }
  }, []);

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-foreground/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-2xl animate-gift-reveal">
        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-5 bg-accent" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center">
          <p className="text-5xl mb-5" aria-hidden>
            {current.emoji}
          </p>
          <h2 className="font-serif text-2xl text-foreground mb-3">{current.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed italic">{current.body}</p>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col gap-3">
          <button
            onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
            className="w-full rounded-md bg-primary py-3 text-sm tracking-wide text-primary-foreground hover:opacity-90 transition"
          >
            {isLast ? "Start listening" : "Next"}
          </button>
          {!isLast && (
            <button
              onClick={finish}
              className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
