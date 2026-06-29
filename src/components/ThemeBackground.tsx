import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";

/**
 * Premium immersive background layer — pointer-events-none.
 * Interactive effects (liquid ripples) use document-level listeners.
 * Uses GPU-accelerated CSS transforms for 60fps performance.
 * Respects prefers-reduced-motion via CSS.
 */

/** Deterministic pseudo-random [0,1) from an integer seed */
function pr(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function ThemeBackground() {
  const { theme } = useTheme();
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ transition: "opacity 0.7s ease" }}
    >
      {theme === "parchment" && <ParchmentScene />}
      {theme === "midnight" && <MidnightScene />}
      {theme === "liquid" && <LiquidScene />}
      {theme === "flower" && <FlowerScene />}
      {theme === "autumn" && <AutumnScene />}
      {theme === "winter" && <WinterScene />}
      {theme === "aurora" && <AuroraScene />}
      {theme === "fire" && <FireScene />}
      {theme === "bamboo" && <BambooScene />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PARCHMENT — aged manuscript, candlelight, floating dust, ink stains
   ───────────────────────────────────────────────────────────────────────── */
function ParchmentScene() {
  const dust = Array.from({ length: 28 }, (_, i) => ({
    left: `${pr(i * 7 + 1) * 100}%`,
    top: `${pr(i * 7 + 2) * 100}%`,
    size: pr(i * 7 + 3) * 3.5 + 1,
    delay: `${pr(i * 7 + 4) * 16}s`,
    duration: `${11 + pr(i * 7 + 5) * 16}s`,
    opacity: 0.2 + pr(i * 7 + 6) * 0.35,
  }));

  const fibers = Array.from({ length: 14 }, (_, i) => ({
    left: `${pr(i * 31 + 1) * 90}%`,
    top: `${pr(i * 31 + 2) * 90}%`,
    width: `${12 + pr(i * 31 + 3) * 28}px`,
    angle: pr(i * 31 + 4) * 360,
    delay: `${pr(i * 31 + 5) * 20}s`,
    duration: `${15 + pr(i * 31 + 6) * 15}s`,
    opacity: 0.08 + pr(i * 31 + 7) * 0.12,
  }));

  return (
    <>
      {/* Parchment vignette — darkened burned edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(120,85,35,0.18) 75%, rgba(80,50,15,0.32) 100%)",
        }}
      />
      {/* Warm candle-glow — top-right */}
      <div
        className="absolute -top-20 -right-20 h-80 w-80 rounded-full animate-candle-breath"
        style={{
          background: "radial-gradient(circle, rgba(255,210,100,0.32), transparent 70%)",
        }}
      />
      {/* Secondary warm wash — bottom-left */}
      <div
        className="absolute -bottom-12 -left-16 h-72 w-72 rounded-full animate-parchment-glow"
        style={{
          background: "radial-gradient(circle, rgba(235,185,85,0.22), transparent 70%)",
        }}
      />
      {/* Centre ambient warmth */}
      <div
        className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-parchment-glow"
        style={{
          background: "radial-gradient(circle, rgba(255,235,175,0.12), transparent 70%)",
          animationDelay: "-4s",
        }}
      />
      {/* Paper fibers */}
      {fibers.map((f, i) => (
        <div
          key={i}
          className="absolute animate-paper-fiber"
          style={{
            left: f.left,
            top: f.top,
            width: f.width,
            height: "1px",
            backgroundColor: `rgba(150,110,55,${f.opacity})`,
            transform: `rotate(${f.angle}deg)`,
            animationDelay: f.delay,
            animationDuration: f.duration,
          }}
        />
      ))}
      {/* Floating dust motes */}
      {dust.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-dust-rise"
          style={{
            left: d.left,
            top: d.top,
            width: `${d.size}px`,
            height: `${d.size}px`,
            backgroundColor: `rgba(175,140,85,${d.opacity})`,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
      {/* Ink stain watermark */}
      <svg
        className="absolute bottom-12 right-10 opacity-[0.04] w-64 h-64 animate-ink-seep"
        viewBox="0 0 200 200"
      >
        <ellipse cx="100" cy="100" rx="82" ry="62" fill="#3a2a10" />
        <ellipse cx="134" cy="122" rx="32" ry="22" fill="#3a2a10" />
        <ellipse cx="72" cy="78" rx="22" ry="30" fill="#3a2a10" />
        <ellipse cx="58" cy="130" rx="14" ry="10" fill="#3a2a10" />
      </svg>
      {/* Secondary ink stain */}
      <svg
        className="absolute top-16 left-12 opacity-[0.03] w-32 h-32 animate-parchment-glow"
        viewBox="0 0 100 100"
        style={{ animationDelay: "-9s" }}
      >
        <ellipse cx="50" cy="50" rx="40" ry="30" fill="#2a1a08" />
        <ellipse cx="70" cy="60" rx="16" ry="12" fill="#2a1a08" />
      </svg>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MIDNIGHT — cosmic night sky, twinkling stars, moon, shooting stars, nebulae
   ───────────────────────────────────────────────────────────────────────── */
function MidnightScene() {
  const stars = Array.from({ length: 110 }, (_, i) => ({
    left: `${pr(i * 11 + 1) * 100}%`,
    top: `${pr(i * 11 + 2) * 88}%`,
    size: pr(i * 11 + 3) * 2.2 + 0.6,
    opacity: 0.3 + pr(i * 11 + 4) * 0.7,
    twinkle: i % 3 !== 2,
    delay: `${pr(i * 11 + 5) * 7}s`,
    duration: `${1.5 + pr(i * 11 + 6) * 4}s`,
  }));

  const cosmicDust = Array.from({ length: 16 }, (_, i) => ({
    left: `${pr(i * 41 + 1) * 100}%`,
    top: `${pr(i * 41 + 2) * 80}%`,
    size: 1 + pr(i * 41 + 3) * 2,
    delay: `${pr(i * 41 + 4) * 12}s`,
    duration: `${8 + pr(i * 41 + 5) * 10}s`,
  }));

  return (
    <>
      {/* Deep sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -5%, oklch(0.18 0.06 250 / 0.60), transparent 62%)" +
            ", radial-gradient(ellipse at 80% 90%, oklch(0.14 0.04 265 / 0.30), transparent 45%)",
        }}
      />
      {/* Nebula blobs */}
      <div
        className="absolute top-1/4 left-1/4 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-nebula-drift"
        style={{ background: "radial-gradient(ellipse, rgba(90,55,175,0.16), transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/5 h-[400px] w-[400px] rounded-full animate-nebula-drift"
        style={{
          background: "radial-gradient(ellipse, rgba(25,75,175,0.14), transparent 70%)",
          animationDelay: "-9s",
        }}
      />
      <div
        className="absolute top-2/3 left-2/3 h-[280px] w-[280px] rounded-full animate-nebula-drift"
        style={{
          background: "radial-gradient(ellipse, rgba(140,55,140,0.10), transparent 70%)",
          animationDelay: "-14s",
        }}
      />
      {/* Moon with corona */}
      <div className="absolute top-12 right-16 animate-moon-glow-pulse">
        <div
          className="h-20 w-20 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 36% 36%, rgba(255,252,230,1), rgba(255,230,150,0.85) 52%, rgba(255,210,100,0.35) 78%, transparent)",
            boxShadow: "0 0 50px 22px rgba(255,225,120,0.20), 0 0 110px 60px rgba(255,200,90,0.09)",
          }}
        />
      </div>
      {/* Stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${s.twinkle ? "animate-star-twinkle" : ""}`}
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: "rgba(255,255,255,0.95)",
            opacity: s.twinkle ? undefined : s.opacity,
            animationDelay: s.twinkle ? s.delay : undefined,
            animationDuration: s.twinkle ? s.duration : undefined,
          }}
        />
      ))}
      {/* Cosmic dust particles */}
      {cosmicDust.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-cosmic-dust"
          style={{
            left: d.left,
            top: d.top,
            width: `${d.size}px`,
            height: `${d.size}px`,
            backgroundColor: "rgba(180,160,255,0.5)",
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
      {/* Shooting stars */}
      <ShootingStar topPct={10} leftPct={5} cycleSeconds={24} phaseSeconds={0} />
      <ShootingStar topPct={5} leftPct={52} cycleSeconds={24} phaseSeconds={9} />
      <ShootingStar topPct={18} leftPct={28} cycleSeconds={24} phaseSeconds={17} />
      <ShootingStar topPct={8} leftPct={72} cycleSeconds={24} phaseSeconds={22} />
      {/* Thin cloud wisps */}
      <div
        className="absolute top-1/4 -left-32 h-16 w-64 rounded-full opacity-10 animate-cloud-drift"
        style={{
          background: "radial-gradient(ellipse, rgba(200,210,255,0.8), transparent 80%)",
          animationDuration: "38s",
        }}
      />
      <div
        className="absolute top-1/3 -left-48 h-10 w-80 rounded-full opacity-8 animate-cloud-drift"
        style={{
          background: "radial-gradient(ellipse, rgba(180,190,255,0.7), transparent 80%)",
          animationDuration: "52s",
          animationDelay: "-18s",
        }}
      />
    </>
  );
}

function ShootingStar({
  topPct,
  leftPct,
  cycleSeconds,
  phaseSeconds,
}: {
  topPct: number;
  leftPct: number;
  cycleSeconds: number;
  phaseSeconds: number;
}) {
  return (
    <div
      className="absolute animate-shooting-star"
      style={{
        top: `${topPct}%`,
        left: `${leftPct}%`,
        animationDuration: `${cycleSeconds}s`,
        animationDelay: `-${phaseSeconds}s`,
        width: "180px",
        height: "2px",
        borderRadius: "2px",
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.96), rgba(255,255,255,0.4) 55%, transparent)",
        transformOrigin: "left center",
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   LIQUID / RAIN — falling rain, deep water glows, click ripples, mist
   ───────────────────────────────────────────────────────────────────────── */
function LiquidScene() {
  const drops = Array.from({ length: 52 }, (_, i) => ({
    left: `${pr(i * 13 + 1) * 100}%`,
    delay: `${pr(i * 13 + 2) * 2.5}s`,
    duration: `${0.38 + pr(i * 13 + 3) * 0.85}s`,
    opacity: 0.12 + pr(i * 13 + 4) * 0.35,
    height: `${40 + pr(i * 13 + 5) * 100}px`,
    width: pr(i * 13 + 6) > 0.7 ? 2 : 1,
  }));

  type Ripple = { id: number; x: number; y: number };
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setRipples((rs) => [
        ...rs.slice(-8),
        { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY },
      ]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Deep water glow orbs */}
      <div
        className="absolute -top-36 -left-36 h-[600px] w-[600px] rounded-full animate-water-drift"
        style={{ background: "radial-gradient(circle, rgba(35,70,225,0.42), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-36 -right-36 h-[620px] w-[620px] rounded-full animate-water-drift"
        style={{
          background: "radial-gradient(circle, rgba(18,165,210,0.34), transparent 70%)",
          animationDelay: "-13s",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-water-drift"
        style={{
          background: "radial-gradient(circle, rgba(50,110,230,0.20), transparent 70%)",
          animationDelay: "-6s",
        }}
      />
      {/* Mist layer */}
      <div
        className="absolute bottom-0 inset-x-0 h-48 animate-mist-drift"
        style={{
          background:
            "linear-gradient(to top, rgba(18,90,195,0.22), rgba(40,130,220,0.08), transparent)",
        }}
      />
      {/* Rain drops */}
      {drops.map((d, i) => (
        <div
          key={i}
          className="absolute top-0 animate-rain-fall"
          style={{
            left: d.left,
            width: `${d.width}px`,
            height: d.height,
            background:
              "linear-gradient(to bottom, transparent, rgba(130,200,255,0.70), transparent)",
            opacity: d.opacity,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
      {/* Wave shimmer */}
      <div
        className="absolute bottom-0 inset-x-0 h-32 animate-wave-pulse"
        style={{
          background:
            "linear-gradient(to top, rgba(15,80,185,0.30), rgba(18,120,205,0.12), transparent)",
        }}
      />
      {/* Click ripples */}
      {ripples.map((rip) => (
        <div
          key={rip.id}
          className="absolute animate-water-ripple-click"
          style={{
            left: rip.x,
            top: rip.y,
            transform: "translate(-50%, -50%)",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            border: "2px solid rgba(130,200,255,0.75)",
            pointerEvents: "none",
          }}
          onAnimationEnd={() => setRipples((rs) => rs.filter((r) => r.id !== rip.id))}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FLOWER GARDEN — falling petals, pollen, botanicals, butterflies
   ───────────────────────────────────────────────────────────────────────── */
function FlowerScene() {
  const petalColors = [
    "rgba(240,160,185,0.75)",
    "rgba(210,148,205,0.70)",
    "rgba(232,185,218,0.72)",
    "rgba(255,175,195,0.68)",
    "rgba(195,165,215,0.72)",
    "rgba(250,200,210,0.65)",
  ];
  const petals = Array.from({ length: 28 }, (_, i) => ({
    left: `${pr(i * 17 + 1) * 100}%`,
    delay: `${pr(i * 17 + 2) * 20}s`,
    duration: `${8 + pr(i * 17 + 3) * 10}s`,
    size: 9 + pr(i * 17 + 4) * 18,
    color: petalColors[i % petalColors.length],
    rotStart: pr(i * 17 + 5) * 360,
    drift: (pr(i * 17 + 6) - 0.5) * 130,
  }));

  const pollen = Array.from({ length: 32 }, (_, i) => ({
    left: `${pr(i * 19 + 7) * 100}%`,
    top: `${25 + pr(i * 19 + 8) * 68}%`,
    size: 1.2 + pr(i * 19 + 9) * 2.8,
    delay: `${pr(i * 19 + 10) * 14}s`,
    duration: `${8 + pr(i * 19 + 11) * 12}s`,
    opacity: 0.3 + pr(i * 19 + 12) * 0.55,
  }));

  return (
    <>
      {/* Dappled garden light */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 84% 8%, rgba(240,145,175,0.28), transparent 44%), " +
            "radial-gradient(circle at 12% 90%, rgba(148,210,142,0.24), transparent 50%), " +
            "radial-gradient(circle at 50% 50%, rgba(255,242,228,0.30), transparent 58%)",
        }}
      />
      {/* Botanical corner decorations */}
      <div className="absolute -top-2 -right-2 w-56 animate-float-blossom-a opacity-90">
        <BlossomCluster />
      </div>
      <div className="absolute bottom-20 -left-2 w-48 animate-float-blossom-b opacity-82">
        <LeafSprig />
      </div>
      <div
        className="absolute top-1/4 left-4 w-10 animate-botanicals-float opacity-22"
        style={{ animationDelay: "-2s" }}
      >
        <SinglePetal />
      </div>
      <div
        className="absolute top-2/3 right-8 w-14 animate-botanicals-float opacity-20"
        style={{ animationDelay: "-5s" }}
      >
        <BuddingBranch />
      </div>
      {/* Falling petals */}
      {petals.map((p, i) => (
        <div
          key={i}
          className="absolute top-0 animate-petal-fall-slow"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: "50% 15%",
            transform: `rotate(${p.rotStart}deg)`,
            ["--petal-drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
      {/* Pollen motes */}
      {pollen.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-pollen-drift"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: `rgba(255,218,72,${p.opacity})`,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
      {/* Butterflies */}
      <Butterfly seed={1} top="22%" startLeft="-5vw" duration={26} delay={0} />
      <Butterfly seed={2} top="55%" startLeft="-5vw" duration={34} delay={12} />
    </>
  );
}

function Butterfly({
  seed,
  top,
  startLeft,
  duration,
  delay,
}: {
  seed: number;
  top: string;
  startLeft: string;
  duration: number;
  delay: number;
}) {
  const color = seed % 2 === 0 ? "#d49fd4" : "#e8a87c";
  return (
    <div
      className="absolute animate-butterfly-path"
      style={{
        top,
        left: startLeft,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg width="24" height="18" viewBox="0 0 24 18" className="animate-butterfly-flutter">
        <ellipse
          cx="6"
          cy="8"
          rx="6"
          ry="8"
          fill={color}
          opacity="0.75"
          transform="rotate(-20 6 8)"
        />
        <ellipse
          cx="18"
          cy="8"
          rx="6"
          ry="8"
          fill={color}
          opacity="0.75"
          transform="rotate(20 18 8)"
        />
        <line x1="12" y1="2" x2="12" y2="16" stroke="#6a4a3a" strokeWidth="0.8" />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   AUTUMN — falling maple leaves, golden fog, warm sunrays
   ───────────────────────────────────────────────────────────────────────── */
function AutumnScene() {
  const leafColors = [
    "#d4621a",
    "#e07a22",
    "#c8421a",
    "#e89030",
    "#b83818",
    "#d46824",
    "#a82c10",
    "#f0a030",
  ];

  const leaves = Array.from({ length: 32 }, (_, i) => ({
    left: `${pr(i * 23 + 1) * 105 - 2}%`,
    delay: `${pr(i * 23 + 2) * 22}s`,
    duration: `${7 + pr(i * 23 + 3) * 10}s`,
    size: 12 + pr(i * 23 + 4) * 20,
    color: leafColors[i % leafColors.length],
    drift: (pr(i * 23 + 5) - 0.5) * 140,
    spin: 270 + pr(i * 23 + 6) * 540,
    opacity: 0.65 + pr(i * 23 + 7) * 0.35,
  }));

  return (
    <>
      {/* Warm amber sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 0%, rgba(255,160,40,0.22), transparent 55%)" +
            ", radial-gradient(ellipse at 15% 100%, rgba(195,95,25,0.18), transparent 50%)" +
            ", radial-gradient(ellipse at 50% 50%, rgba(240,195,95,0.10), transparent 65%)",
        }}
      />
      {/* Sunray shafts */}
      <div
        className="absolute top-0 left-1/4 h-full w-28 animate-sunray origin-top"
        style={{
          background: "linear-gradient(to bottom, rgba(255,180,50,0.14), transparent 70%)",
          transform: "rotate(-15deg)",
        }}
      />
      <div
        className="absolute top-0 left-1/3 h-3/4 w-14 animate-sunray origin-top"
        style={{
          background: "linear-gradient(to bottom, rgba(255,200,80,0.10), transparent 70%)",
          transform: "rotate(-12deg)",
          animationDelay: "-4s",
        }}
      />
      {/* Fog layers */}
      <div
        className="absolute bottom-0 inset-x-0 h-36 animate-fog-drift"
        style={{
          background:
            "linear-gradient(to top, rgba(200,130,50,0.14), rgba(220,165,80,0.05), transparent)",
        }}
      />
      <div
        className="absolute top-1/3 inset-x-0 h-24 animate-fog-drift"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(220,170,80,0.06), transparent)",
          animationDelay: "-12s",
        }}
      />
      {/* Falling maple leaves */}
      {leaves.map((l, i) => (
        <div
          key={i}
          className="absolute top-0 animate-leaf-fall"
          style={{
            left: l.left,
            animationDelay: l.delay,
            animationDuration: l.duration,
            opacity: l.opacity,
            ["--leaf-drift" as string]: `${l.drift}px`,
            ["--leaf-spin" as string]: `${l.spin}deg`,
          }}
        >
          <MapleLeaf size={l.size} color={l.color} />
        </div>
      ))}
      {/* Ground vignette */}
      <div
        className="absolute bottom-0 inset-x-0 h-20"
        style={{
          background: "linear-gradient(to top, rgba(160,75,15,0.15), transparent)",
        }}
      />
    </>
  );
}

function MapleLeaf({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill={color}
      style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.2))` }}
    >
      {/* Simplified maple leaf shape */}
      <path d="M20 2 L22 8 L28 6 L24 12 L32 14 L26 18 L30 24 L22 22 L22 36 L18 36 L18 22 L10 24 L14 18 L8 14 L16 12 L12 6 L18 8 Z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   WINTER — falling snowflakes, frost edges, ice sparkles, cold mist
   ───────────────────────────────────────────────────────────────────────── */
function WinterScene() {
  const snowflakes = Array.from({ length: 65 }, (_, i) => ({
    left: `${pr(i * 37 + 1) * 104 - 2}%`,
    delay: `${pr(i * 37 + 2) * 14}s`,
    duration: `${5 + pr(i * 37 + 3) * 9}s`,
    size: 2 + pr(i * 37 + 4) * 7,
    drift: (pr(i * 37 + 5) - 0.5) * 80,
    opacity: 0.5 + pr(i * 37 + 6) * 0.5,
    isFlake: pr(i * 37 + 7) > 0.45,
  }));

  const sparkles = Array.from({ length: 22 }, (_, i) => ({
    left: `${pr(i * 43 + 1) * 100}%`,
    top: `${50 + pr(i * 43 + 2) * 50}%`,
    size: 4 + pr(i * 43 + 3) * 8,
    delay: `${pr(i * 43 + 4) * 6}s`,
    duration: `${2 + pr(i * 43 + 5) * 3}s`,
  }));

  return (
    <>
      {/* Cold sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, rgba(180,215,255,0.30), transparent 60%)" +
            ", radial-gradient(ellipse at 80% 80%, rgba(160,200,255,0.15), transparent 50%)",
        }}
      />
      {/* Frost vignette edges */}
      <div
        className="absolute inset-0 animate-frost-grow"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(200,230,255,0.12) 80%, rgba(190,220,255,0.25) 100%)",
        }}
      />
      {/* Cold mist at bottom */}
      <div
        className="absolute bottom-0 inset-x-0 h-48 animate-mist-freeze"
        style={{
          background:
            "linear-gradient(to top, rgba(200,225,255,0.18), rgba(210,232,255,0.06), transparent)",
        }}
      />
      {/* Snowflakes */}
      {snowflakes.map((s, i) => (
        <div
          key={i}
          className="absolute top-0 animate-snow-fall"
          style={{
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.duration,
            opacity: s.opacity,
            ["--snow-drift" as string]: `${s.drift}px`,
          }}
        >
          {s.isFlake ? (
            <Snowflake size={s.size} />
          ) : (
            <div
              style={{
                width: `${s.size * 0.7}px`,
                height: `${s.size * 0.7}px`,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.90)",
              }}
            />
          )}
        </div>
      ))}
      {/* Ice sparkles on the ground area */}
      {sparkles.map((sp, i) => (
        <div
          key={i}
          className="absolute animate-ice-sparkle"
          style={{
            left: sp.left,
            top: sp.top,
            animationDelay: sp.delay,
            animationDuration: sp.duration,
          }}
        >
          <svg width={sp.size} height={sp.size} viewBox="0 0 20 20">
            <path
              d="M10 1 L11 9 L19 10 L11 11 L10 19 L9 11 L1 10 L9 9 Z"
              fill="rgba(200,230,255,0.9)"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="0.5"
            />
          </svg>
        </div>
      ))}
      {/* Frost crystal SVG edges */}
      <FrostEdge position="top-left" />
      <FrostEdge position="bottom-right" />
    </>
  );
}

function Snowflake({ size }: { size: number }) {
  const s = size;
  const cx = s / 2,
    cy = s / 2,
    r = s * 0.45;
  const arms = [0, 60, 120, 180, 240, 300];
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {arms.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <g key={angle}>
            <line
              x1={cx}
              y1={cy}
              x2={cx + r * Math.cos(rad)}
              y2={cy + r * Math.sin(rad)}
              stroke="rgba(255,255,255,0.88)"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <line
              x1={cx + r * 0.45 * Math.cos(rad)}
              y1={cy + r * 0.45 * Math.sin(rad)}
              x2={cx + r * 0.65 * Math.cos(rad + 0.6)}
              y2={cy + r * 0.65 * Math.sin(rad + 0.6)}
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="0.6"
              strokeLinecap="round"
            />
            <line
              x1={cx + r * 0.45 * Math.cos(rad)}
              y1={cy + r * 0.45 * Math.sin(rad)}
              x2={cx + r * 0.65 * Math.cos(rad - 0.6)}
              y2={cy + r * 0.65 * Math.sin(rad - 0.6)}
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="0.6"
              strokeLinecap="round"
            />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r="1.2" fill="rgba(255,255,255,0.95)" />
    </svg>
  );
}

function FrostEdge({ position }: { position: "top-left" | "bottom-right" }) {
  const isTopLeft = position === "top-left";
  return (
    <svg
      className="absolute opacity-[0.18] animate-frost-grow"
      style={isTopLeft ? { top: 0, left: 0 } : { bottom: 0, right: 0, transform: "rotate(180deg)" }}
      width="220"
      height="220"
      viewBox="0 0 220 220"
    >
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * 90 - 45;
        const rad = (angle * Math.PI) / 180;
        const len = 60 + pr(i * 7) * 80;
        return (
          <g key={i}>
            <line
              x1="0"
              y1="0"
              x2={len * Math.cos(rad)}
              y2={len * Math.sin(rad)}
              stroke="rgba(200,230,255,0.8)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {[0.4, 0.65].map((t, j) => (
              <line
                key={j}
                x1={t * len * Math.cos(rad)}
                y1={t * len * Math.sin(rad)}
                x2={(t + 0.18) * len * Math.cos(rad + 0.5)}
                y2={(t + 0.18) * len * Math.sin(rad + 0.5)}
                stroke="rgba(200,230,255,0.6)"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   AURORA — northern lights ribbons, mountains, stars, floating particles
   ───────────────────────────────────────────────────────────────────────── */
function AuroraScene() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    left: `${pr(i * 13 + 1) * 100}%`,
    top: `${pr(i * 13 + 2) * 60}%`,
    size: 0.6 + pr(i * 13 + 3) * 1.8,
    opacity: 0.25 + pr(i * 13 + 4) * 0.75,
    twinkle: i % 4 !== 3,
    delay: `${pr(i * 13 + 5) * 5}s`,
    duration: `${2 + pr(i * 13 + 6) * 3}s`,
  }));

  const ribbons = [
    {
      colors: "rgba(40,220,140,0.55), rgba(80,160,255,0.50), rgba(140,60,220,0.45)",
      yOffset: "15%",
      delay: "0s",
      duration: "14s",
      scaleY: 0.8,
    },
    {
      colors: "rgba(60,200,255,0.40), rgba(40,180,120,0.45), rgba(100,80,255,0.38)",
      yOffset: "22%",
      delay: "-5s",
      duration: "18s",
      scaleY: 0.6,
    },
    {
      colors: "rgba(120,50,220,0.35), rgba(40,220,160,0.40), rgba(60,140,255,0.35)",
      yOffset: "30%",
      delay: "-9s",
      duration: "22s",
      scaleY: 0.5,
    },
    {
      colors: "rgba(30,240,120,0.28), rgba(80,80,255,0.30), rgba(160,40,200,0.28)",
      yOffset: "10%",
      delay: "-14s",
      duration: "26s",
      scaleY: 0.4,
    },
  ];

  return (
    <>
      {/* Deep night sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.04 0.02 265), oklch(0.08 0.04 265) 60%, oklch(0.12 0.05 268))",
        }}
      />
      {/* Stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${s.twinkle ? "animate-star-twinkle" : ""}`}
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: "rgba(255,255,255,0.95)",
            opacity: s.twinkle ? undefined : s.opacity,
            animationDelay: s.twinkle ? s.delay : undefined,
            animationDuration: s.twinkle ? s.duration : undefined,
          }}
        />
      ))}
      {/* Aurora ribbons */}
      {ribbons.map((rib, i) => (
        <div
          key={i}
          className="absolute inset-x-0 animate-aurora-shimmer"
          style={{
            top: rib.yOffset,
            height: "300px",
            background: `linear-gradient(to bottom, transparent, ${rib.colors}, transparent)`,
            filter: "blur(18px)",
            transform: `scaleY(${rib.scaleY})`,
            transformOrigin: "top",
            animationDelay: rib.delay,
            animationDuration: rib.duration,
          }}
        />
      ))}
      {/* Mountain silhouette */}
      <svg
        className="absolute bottom-0 inset-x-0 w-full"
        viewBox="0 0 1200 260"
        preserveAspectRatio="none"
        style={{ height: "260px" }}
      >
        {/* Far mountains */}
        <path
          d="M0 260 L0 180 L80 120 L160 155 L260 90 L360 130 L440 75 L540 110 L640 60 L740 100 L840 70 L940 115 L1040 80 L1120 130 L1200 100 L1200 260 Z"
          fill="oklch(0.06 0.04 265)"
          opacity="0.9"
        />
        {/* Near mountains */}
        <path
          d="M0 260 L0 210 L60 170 L140 195 L220 155 L320 185 L400 145 L480 175 L560 138 L660 168 L740 130 L840 160 L920 128 L1020 162 L1100 142 L1200 168 L1200 260 Z"
          fill="oklch(0.05 0.038 265)"
          opacity="1"
        />
      </svg>
      {/* Floating aurora particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-cosmic-dust"
          style={{
            left: `${pr(i * 61 + 1) * 100}%`,
            top: `${pr(i * 61 + 2) * 55}%`,
            width: `${2 + pr(i * 61 + 3) * 3}px`,
            height: `${2 + pr(i * 61 + 3) * 3}px`,
            backgroundColor:
              i % 3 === 0
                ? "rgba(40,220,140,0.7)"
                : i % 3 === 1
                  ? "rgba(80,140,255,0.7)"
                  : "rgba(160,60,220,0.7)",
            animationDelay: `${pr(i * 61 + 4) * 12}s`,
            animationDuration: `${8 + pr(i * 61 + 5) * 8}s`,
          }}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FIRE — ember particles, flame glow, lava cracks, heat shimmer
   ───────────────────────────────────────────────────────────────────────── */
function FireScene() {
  const emberColors = [
    "rgba(255,120,20,0.9)",
    "rgba(255,180,30,0.85)",
    "rgba(255,80,10,0.88)",
    "rgba(255,210,60,0.75)",
    "rgba(240,60,10,0.82)",
  ];

  const embers = Array.from({ length: 55 }, (_, i) => ({
    left: `${10 + pr(i * 47 + 1) * 80}%`,
    delay: `${pr(i * 47 + 2) * 6}s`,
    duration: `${2.5 + pr(i * 47 + 3) * 3.5}s`,
    size: 1.5 + pr(i * 47 + 4) * 4,
    color: emberColors[i % emberColors.length],
    rise: -(60 + pr(i * 47 + 5) * 180),
    sway: (pr(i * 47 + 6) - 0.5) * 60,
  }));

  return (
    <>
      {/* Dark volcanic background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 110%, rgba(200,50,0,0.30), transparent 55%)" +
            ", radial-gradient(ellipse at 30% 80%, rgba(255,100,0,0.18), transparent 40%)" +
            ", radial-gradient(ellipse at 70% 75%, rgba(255,140,0,0.14), transparent 35%)",
        }}
      />
      {/* Lava crack glow — bottom */}
      <div
        className="absolute bottom-0 inset-x-0 h-28 animate-lava-glow"
        style={{
          background:
            "linear-gradient(to top, rgba(255,80,10,0.45), rgba(255,140,20,0.20), rgba(200,50,0,0.08), transparent)",
        }}
      />
      {/* Lava crack SVG lines */}
      <svg
        className="absolute bottom-0 inset-x-0 w-full opacity-35 animate-lava-glow"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{ height: "120px" }}
      >
        <defs>
          <linearGradient id="lava-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(255,130,20,0.9)" />
            <stop offset="100%" stopColor="rgba(255,80,10,0)" />
          </linearGradient>
        </defs>
        <path
          d="M0 120 Q100 80 180 100 Q280 60 380 90 Q480 40 560 80 Q660 50 740 85 Q840 30 960 75 Q1060 50 1140 80 L1200 120 Z"
          fill="url(#lava-grad)"
        />
        <path
          d="M0 120 Q80 90 150 110 Q220 70 300 100 Q400 55 480 90 Q570 60 650 95 Q750 45 870 80 Q970 55 1060 85 Q1130 65 1200 90 L1200 120 Z"
          fill="rgba(255,160,20,0.25)"
        />
      </svg>
      {/* Flame glow blobs */}
      <div
        className="absolute bottom-0 left-1/4 h-64 w-64 -translate-x-1/2 rounded-full animate-flame-dance"
        style={{ background: "radial-gradient(circle, rgba(255,100,10,0.28), transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-1/4 h-56 w-56 -translate-x-1/2 rounded-full animate-flame-dance"
        style={{
          background: "radial-gradient(circle, rgba(255,150,20,0.22), transparent 70%)",
          animationDelay: "-0.4s",
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full animate-flame-dance"
        style={{
          background: "radial-gradient(circle, rgba(255,80,5,0.32), transparent 68%)",
          animationDelay: "-0.2s",
        }}
      />
      {/* Ember particles */}
      {embers.map((e, i) => (
        <div
          key={i}
          className="absolute bottom-8 animate-ember-rise"
          style={{
            left: e.left,
            width: `${e.size}px`,
            height: `${e.size}px`,
            borderRadius: "50%",
            backgroundColor: e.color,
            boxShadow: `0 0 ${e.size * 3}px ${e.size}px ${e.color.replace("0.9", "0.4")}`,
            animationDelay: e.delay,
            animationDuration: e.duration,
            ["--ember-rise" as string]: `${e.rise}px`,
            ["--ember-sway" as string]: `${e.sway}px`,
          }}
        />
      ))}
      {/* Dark vignette top */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(5,0,0,0.65) 100%)",
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   BAMBOO / ZEN — swaying bamboo, floating leaves, mist, stream, birds
   ───────────────────────────────────────────────────────────────────────── */
function BambooScene() {
  const bambooStalks = Array.from({ length: 12 }, (_, i) => ({
    left: `${pr(i * 53 + 1) * 90 + 2}%`,
    height: 55 + pr(i * 53 + 2) * 45,
    width: 12 + pr(i * 53 + 3) * 10,
    delay: `${pr(i * 53 + 4) * 4}s`,
    duration: `${5 + pr(i * 53 + 5) * 4}s`,
    shade: pr(i * 53 + 6),
  }));

  const fallingLeaves = Array.from({ length: 20 }, (_, i) => ({
    left: `${pr(i * 59 + 1) * 100}%`,
    delay: `${pr(i * 59 + 2) * 20}s`,
    duration: `${8 + pr(i * 59 + 3) * 10}s`,
    size: 8 + pr(i * 59 + 4) * 12,
    drift: (pr(i * 59 + 5) - 0.5) * 100,
    spin: 180 + pr(i * 59 + 6) * 360,
  }));

  return (
    <>
      {/* Soft green ambient light */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(100,180,80,0.16), transparent 55%)" +
            ", radial-gradient(ellipse at 10% 80%, rgba(60,140,50,0.12), transparent 45%)" +
            ", radial-gradient(ellipse at 90% 60%, rgba(80,170,60,0.10), transparent 40%)",
        }}
      />
      {/* Bamboo stalks */}
      {bambooStalks.map((b, i) => (
        <div
          key={i}
          className="absolute bottom-0 animate-bamboo-sway"
          style={{
            left: b.left,
            height: `${b.height}vh`,
            width: `${b.width}px`,
            animationDelay: b.delay,
            animationDuration: b.duration,
            transformOrigin: "bottom center",
          }}
        >
          <BambooStalk height={b.height} width={b.width} shade={b.shade} />
        </div>
      ))}
      {/* Ground mist / water stream */}
      <div
        className="absolute bottom-0 inset-x-0 h-28 animate-zen-mist"
        style={{
          background:
            "linear-gradient(to top, rgba(180,220,180,0.18), rgba(200,240,200,0.06), transparent)",
        }}
      />
      <div
        className="absolute bottom-8 inset-x-0 h-12 animate-stream-flow"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(160,220,200,0.12), rgba(140,200,180,0.16), transparent)",
          backgroundSize: "200% 100%",
        }}
      />
      {/* Misty layers */}
      <div
        className="absolute top-1/3 inset-x-0 h-32 animate-zen-mist"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(200,230,200,0.08), transparent)",
          animationDelay: "-8s",
        }}
      />
      {/* Falling bamboo leaves */}
      {fallingLeaves.map((l, i) => (
        <div
          key={i}
          className="absolute top-0 animate-leaf-fall"
          style={{
            left: l.left,
            animationDelay: l.delay,
            animationDuration: l.duration,
            ["--leaf-drift" as string]: `${l.drift}px`,
            ["--leaf-spin" as string]: `${l.spin}deg`,
          }}
        >
          <BambooLeafSvg size={l.size} />
        </div>
      ))}
      {/* Birds flying across */}
      <BirdFlock topPct={12} delay={0} duration={32} />
      <BirdFlock topPct={8} delay={16} duration={40} />
    </>
  );
}

function BambooStalk({ height, width, shade }: { height: number; width: number; shade: number }) {
  const segmentCount = Math.floor(height / 12);
  const green = Math.round(110 + shade * 50);
  const color = `rgb(${Math.round(50 + shade * 30)}, ${green}, ${Math.round(40 + shade * 30)})`;
  const nodeColor = `rgb(${Math.round(35 + shade * 25)}, ${Math.round(95 + shade * 40)}, ${Math.round(30 + shade * 25)})`;

  return (
    <svg
      width={width}
      height="100%"
      viewBox={`0 0 ${width} ${height * 10}`}
      preserveAspectRatio="none"
    >
      <rect x="0" y="0" width={width} height={height * 10} fill={color} rx={width * 0.2} />
      {Array.from({ length: segmentCount }, (_, i) => (
        <rect
          key={i}
          x="0"
          y={i * 10 * 12}
          width={width}
          height={width * 0.5}
          fill={nodeColor}
          rx={width * 0.15}
          opacity="0.9"
        />
      ))}
      {/* Subtle highlight */}
      <rect
        x="2"
        y="0"
        width={Math.max(2, width * 0.2)}
        height={height * 10}
        fill="rgba(255,255,255,0.12)"
        rx={width * 0.1}
      />
    </svg>
  );
}

function BambooLeafSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 30 14">
      <path
        d="M1 7 Q8 0 20 3 Q28 5 29 7 Q28 9 20 11 Q8 14 1 7 Z"
        fill="rgba(80,160,60,0.80)"
        stroke="rgba(50,120,40,0.5)"
        strokeWidth="0.5"
      />
      <line x1="2" y1="7" x2="28" y2="7" stroke="rgba(50,120,40,0.4)" strokeWidth="0.6" />
    </svg>
  );
}

function BirdFlock({
  topPct,
  delay,
  duration,
}: {
  topPct: number;
  delay: number;
  duration: number;
}) {
  return (
    <div
      className="absolute animate-bird-fly"
      style={{
        top: `${topPct}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
        {[
          [10, 10],
          [22, 6],
          [34, 10],
          [46, 7],
          [58, 11],
        ].map(([x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y} Q${x + 3} ${y - 4} ${x + 6} ${y}`}
            stroke="rgba(60,120,50,0.55)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   BOTANICAL SVG ILLUSTRATIONS (used in FlowerScene)
   ───────────────────────────────────────────────────────────────────────── */
function BlossomCluster() {
  return (
    <svg viewBox="0 0 120 120" fill="none">
      <g transform="translate(60 50)">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse
            key={r}
            cx="0"
            cy="-18"
            rx="11"
            ry="18"
            fill="#e6a8b8"
            transform={`rotate(${r})`}
            opacity="0.85"
          />
        ))}
        <circle r="7" fill="#c97a8c" />
      </g>
      <g transform="translate(28 78)">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse
            key={r}
            cx="0"
            cy="-12"
            rx="7"
            ry="12"
            fill="#f0c4cf"
            transform={`rotate(${r})`}
            opacity="0.85"
          />
        ))}
        <circle r="4" fill="#b76577" />
      </g>
      <path
        d="M 60 64 Q 50 80 32 88"
        stroke="#7a9070"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 45 78 Q 38 82 30 78"
        stroke="#7a9070"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LeafSprig() {
  return (
    <svg viewBox="0 0 120 120" fill="none">
      <path
        d="M 20 110 Q 50 80 90 30"
        stroke="#6f8a68"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {(
        [
          [30, 95, -30],
          [42, 80, -25],
          [55, 65, -20],
          [68, 52, -15],
          [80, 40, -10],
        ] as [number, number, number][]
      ).map(([cx, cy, rot], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="10"
          ry="5"
          fill="#8aa882"
          opacity="0.85"
          transform={`rotate(${rot} ${cx} ${cy})`}
        />
      ))}
      {(
        [
          [35, 100, 30],
          [48, 85, 25],
          [62, 70, 20],
          [74, 56, 15],
        ] as [number, number, number][]
      ).map(([cx, cy, rot], i) => (
        <ellipse
          key={`r${i}`}
          cx={cx}
          cy={cy}
          rx="9"
          ry="4.5"
          fill="#a3bf9b"
          opacity="0.80"
          transform={`rotate(${rot} ${cx} ${cy})`}
        />
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
      <path
        d="M 8 52 Q 28 36 50 12"
        stroke="#7a9070"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="50" cy="12" r="5" fill="#c98598" />
      <circle cx="36" cy="26" r="3.5" fill="#d9a7b3" />
      <circle cx="22" cy="40" r="3" fill="#b994a5" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FLOWER REVEAL PETALS — used on gift.$id when theme === "flower"
   ───────────────────────────────────────────────────────────────────────── */
export function FlowerRevealPetals() {
  const petals = [
    { left: "18%", delay: "0s", drift: "35px" },
    { left: "62%", delay: "0.22s", drift: "-28px" },
    { left: "42%", delay: "0.45s", drift: "12px" },
    { left: "76%", delay: "0.65s", drift: "-18px" },
    { left: "30%", delay: "0.85s", drift: "22px" },
  ];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {petals.map((p, i) => (
        <div
          key={i}
          className="absolute top-0 w-7 animate-petal-drift"
          style={{
            left: p.left,
            animationDelay: p.delay,
            ["--petal-x" as string]: p.drift,
          }}
        >
          <SinglePetal />
        </div>
      ))}
    </div>
  );
}
