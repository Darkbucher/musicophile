import { useTheme } from "@/lib/theme";

/**
 * Fixed, pointer-events-none decoration layer behind all content.
 * Each theme renders a distinct mood: candle, deep water, garden,
 * arcade grid, moonlit canopy. Parchment is intentionally bare.
 */
export function ThemeBackground() {
  const { theme } = useTheme();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {theme === "midnight" && (
        <div
          className="absolute left-1/2 top-1/3 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-candle-breath"
          style={{ background: "radial-gradient(circle, rgba(255,184,90,0.28), transparent 70%)" }}
        />
      )}

      {theme === "liquid" && (
        <>
          <div
            className="absolute -top-24 -left-24 h-[460px] w-[460px] rounded-full animate-water-drift"
            style={{ background: "radial-gradient(circle, rgba(80,60,210,0.45), transparent 70%)" }}
          />
          <div
            className="absolute -bottom-24 -right-20 h-[480px] w-[480px] rounded-full animate-water-drift"
            style={{ background: "radial-gradient(circle, rgba(40,200,220,0.35), transparent 70%)", animationDelay: "-12s" }}
          />
        </>
      )}

      {theme === "flower" && <FlowerScene />}

      {theme === "retro" && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(20,30,90,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(20,30,90,0.45) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      )}

      {theme === "forest" && (
        <div
          className="absolute left-1/2 -top-24 h-[520px] w-[520px] -translate-x-1/2 rounded-full animate-moonlight-breath"
          style={{ background: "radial-gradient(circle, rgba(150,235,170,0.22), transparent 70%)" }}
        />
      )}
    </div>
  );
}

function FlowerScene() {
  return (
    <>
      {/* Dappled garden light — three overlapping washes */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 88% 12%, rgba(232,140,160,0.28), transparent 45%), radial-gradient(circle at 12% 92%, rgba(160,200,150,0.25), transparent 50%), radial-gradient(circle at 50% 50%, rgba(255,238,218,0.35), transparent 60%)",
        }}
      />
      {/* Top-right blossom cluster */}
      <div className="absolute -top-2 -right-2 w-36 animate-float-blossom-a opacity-90">
        <BlossomCluster />
      </div>
      {/* Bottom-left leaf sprig */}
      <div className="absolute bottom-24 -left-2 w-32 animate-float-blossom-b opacity-85">
        <LeafSprig />
      </div>
      {/* Scattered atmospheric accents */}
      <div className="absolute top-1/4 left-4 w-10 animate-botanicals-float opacity-25">
        <SinglePetal />
      </div>
      <div className="absolute top-2/3 right-6 w-12 animate-botanicals-float opacity-20" style={{ animationDelay: "-3s" }}>
        <BuddingBranch />
      </div>
      <div className="absolute top-1/2 left-1/2 w-8 animate-botanicals-float opacity-15" style={{ animationDelay: "-6s" }}>
        <SinglePetal />
      </div>
    </>
  );
}

/* ── Inline botanical illustrations (soft rose / sage / mauve) ── */

function BlossomCluster() {
  return (
    <svg viewBox="0 0 120 120" fill="none">
      <g transform="translate(60 50)">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="0" cy="-18" rx="11" ry="18" fill="#e6a8b8" transform={`rotate(${r})`} opacity="0.85" />
        ))}
        <circle r="7" fill="#c97a8c" />
      </g>
      <g transform="translate(28 78)">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="0" cy="-12" rx="7" ry="12" fill="#f0c4cf" transform={`rotate(${r})`} opacity="0.85" />
        ))}
        <circle r="4" fill="#b76577" />
      </g>
      <path d="M 60 64 Q 50 80 32 88" stroke="#7a9070" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 45 78 Q 38 82 30 78" stroke="#7a9070" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function LeafSprig() {
  return (
    <svg viewBox="0 0 120 120" fill="none">
      <path d="M 20 110 Q 50 80 90 30" stroke="#6f8a68" strokeWidth="2" fill="none" strokeLinecap="round" />
      {[
        [30, 95, -30],
        [42, 80, -25],
        [55, 65, -20],
        [68, 52, -15],
        [80, 40, -10],
      ].map(([cx, cy, rot], i) => (
        <ellipse key={i} cx={cx as number} cy={cy as number} rx="10" ry="5" fill="#8aa882" opacity="0.85" transform={`rotate(${rot} ${cx} ${cy})`} />
      ))}
      {[
        [35, 100, 30],
        [48, 85, 25],
        [62, 70, 20],
        [74, 56, 15],
      ].map(([cx, cy, rot], i) => (
        <ellipse key={`r-${i}`} cx={cx as number} cy={cy as number} rx="9" ry="4.5" fill="#a3bf9b" opacity="0.8" transform={`rotate(${rot} ${cx} ${cy})`} />
      ))}
    </svg>
  );
}

function SinglePetal() {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="20" rx="8" ry="16" fill="#d9a7b3" transform="rotate(35 20 20)" />
    </svg>
  );
}

function BuddingBranch() {
  return (
    <svg viewBox="0 0 60 60" fill="none">
      <path d="M 8 52 Q 28 36 50 12" stroke="#7a9070" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="12" r="5" fill="#c98598" />
      <circle cx="36" cy="26" r="3.5" fill="#d9a7b3" />
      <circle cx="22" cy="40" r="3" fill="#b994a5" />
    </svg>
  );
}

/** Petals that drift down during the flower-theme gift reveal. */
export function FlowerRevealPetals() {
  const petals = [
    { left: "20%", delay: "0s", x: "30px" },
    { left: "65%", delay: "0.25s", x: "-20px" },
    { left: "45%", delay: "0.5s", x: "10px" },
  ];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {petals.map((p, i) => (
        <div
          key={i}
          className="absolute top-0 w-6 animate-petal-drift"
          style={{ left: p.left, animationDelay: p.delay, ["--petal-x" as string]: p.x }}
        >
          <SinglePetal />
        </div>
      ))}
    </div>
  );
}
