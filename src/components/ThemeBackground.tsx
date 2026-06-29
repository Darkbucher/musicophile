import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";

/**
 * Premium immersive background layer — pointer-events-none except where
 * interactive effects need document-level listeners (Liquid ripple).
 * Uses a deterministic pseudo-random function so particle layouts are stable
 * across renders without needing useEffect/useRef seeding.
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
      style={{ transition: "opacity 0.6s ease" }}
    >
      {theme === "parchment" && <ParchmentScene />}
      {theme === "midnight" && <MidnightScene />}
      {theme === "liquid"   && <LiquidScene />}
      {theme === "flower"   && <FlowerScene />}
      {theme === "retro"    && <RetroScene />}
      {theme === "forest"   && <ForestScene />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PARCHMENT — aged manuscript, warm candlelight, floating dust
   ───────────────────────────────────────────────────────────────────────── */
function ParchmentScene() {
  const dust = Array.from({ length: 22 }, (_, i) => ({
    left:     `${pr(i * 7 + 1) * 100}%`,
    top:      `${pr(i * 7 + 2) * 100}%`,
    size:     pr(i * 7 + 3) * 3 + 1.5,
    delay:    `${pr(i * 7 + 4) * 14}s`,
    duration: `${10 + pr(i * 7 + 5) * 14}s`,
    opacity:  0.25 + pr(i * 7 + 6) * 0.3,
  }));

  return (
    <>
      {/* Vignette — darkened parchment edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(140,110,60,0.22) 100%)",
        }}
      />
      {/* Warm candle-glow pool — top-right corner */}
      <div
        className="absolute -top-16 -right-16 h-72 w-72 rounded-full animate-candle-breath"
        style={{
          background:
            "radial-gradient(circle, rgba(255,205,110,0.28), transparent 70%)",
        }}
      />
      {/* Secondary warm wash — lower-left */}
      <div
        className="absolute bottom-0 -left-12 h-64 w-64 rounded-full animate-parchment-glow"
        style={{
          background:
            "radial-gradient(circle, rgba(230,185,95,0.18), transparent 70%)",
        }}
      />
      {/* Centre ambient warmth */}
      <div
        className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-parchment-glow"
        style={{
          background:
            "radial-gradient(circle, rgba(255,230,170,0.10), transparent 70%)",
          animationDelay: "-4s",
        }}
      />
      {/* Floating dust motes */}
      {dust.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-dust-rise"
          style={{
            left:              d.left,
            top:               d.top,
            width:             `${d.size}px`,
            height:            `${d.size}px`,
            backgroundColor:   `rgba(180,150,95,${d.opacity})`,
            animationDelay:    d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
      {/* Ink-stain watermark SVG — subtle, decorative */}
      <svg
        className="absolute bottom-10 right-8 opacity-[0.04] w-56 h-56 animate-parchment-glow"
        viewBox="0 0 200 200"
        style={{ animationDelay: "-7s" }}
      >
        <ellipse cx="100" cy="100" rx="80" ry="60" fill="#3a2a10" />
        <ellipse cx="130" cy="120" rx="30" ry="20" fill="#3a2a10" />
        <ellipse cx="70"  cy="80"  rx="20" ry="28" fill="#3a2a10" />
      </svg>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MIDNIGHT — cosmic night sky, stars, moon, shooting stars, nebula
   ───────────────────────────────────────────────────────────────────────── */
function MidnightScene() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    left:     `${pr(i * 11 + 1) * 100}%`,
    top:      `${pr(i * 11 + 2) * 85}%`,
    size:     pr(i * 11 + 3) * 2 + 0.8,
    opacity:  0.35 + pr(i * 11 + 4) * 0.65,
    twinkle:  i % 3 === 0,
    delay:    `${pr(i * 11 + 5) * 6}s`,
    duration: `${1.8 + pr(i * 11 + 6) * 3.5}s`,
  }));

  return (
    <>
      {/* Night-sky gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, oklch(0.18 0.05 250 / 0.55), transparent 65%)",
        }}
      />
      {/* Nebula colour blobs */}
      <div
        className="absolute top-1/4 left-1/4 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-nebula-drift"
        style={{
          background:
            "radial-gradient(ellipse, rgba(90,60,160,0.14), transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/5 h-[360px] w-[360px] rounded-full animate-nebula-drift"
        style={{
          background:
            "radial-gradient(ellipse, rgba(30,80,160,0.12), transparent 70%)",
          animationDelay: "-8s",
        }}
      />
      {/* Moon */}
      <div className="absolute top-14 right-14 animate-moon-glow-pulse">
        <div
          className="h-16 w-16 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 38% 38%, rgba(255,248,220,1), rgba(255,225,160,0.8) 55%, rgba(255,200,100,0.3) 80%, transparent)",
            boxShadow:
              "0 0 40px 18px rgba(255,220,130,0.18), 0 0 90px 50px rgba(255,200,100,0.08)",
          }}
        />
      </div>
      {/* Stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${s.twinkle ? "animate-star-twinkle" : ""}`}
          style={{
            left:              s.left,
            top:               s.top,
            width:             `${s.size}px`,
            height:            `${s.size}px`,
            backgroundColor:   "white",
            opacity:           s.twinkle ? undefined : s.opacity,
            animationDelay:    s.twinkle ? s.delay    : undefined,
            animationDuration: s.twinkle ? s.duration : undefined,
          }}
        />
      ))}
      {/* Shooting stars — staggered across a long cycle */}
      <ShootingStar topPct={12} leftPct={8}  cycleSeconds={22} phaseSeconds={0} />
      <ShootingStar topPct={6}  leftPct={55} cycleSeconds={22} phaseSeconds={10} />
      <ShootingStar topPct={20} leftPct={30} cycleSeconds={22} phaseSeconds={17} />
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
        top:               `${topPct}%`,
        left:              `${leftPct}%`,
        animationDuration: `${cycleSeconds}s`,
        animationDelay:    `${phaseSeconds}s`,
        width:             "140px",
        height:            "2px",
        borderRadius:      "2px",
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.3) 60%, transparent)",
        transformOrigin:   "left center",
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   LIQUID / RAIN — falling rain, ripples, deep water
   ───────────────────────────────────────────────────────────────────────── */
function LiquidScene() {
  const drops = Array.from({ length: 36 }, (_, i) => ({
    left:     `${pr(i * 13 + 1) * 100}%`,
    delay:    `${pr(i * 13 + 2) * 2.2}s`,
    duration: `${0.45 + pr(i * 13 + 3) * 0.75}s`,
    opacity:  0.14 + pr(i * 13 + 4) * 0.32,
    height:   `${45 + pr(i * 13 + 5) * 90}px`,
    width:    pr(i * 13 + 6) > 0.72 ? 2 : 1,
  }));

  // Click-ripple layer — pointer events captured at document level
  type Ripple = { id: number; x: number; y: number };
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setRipples((rs) => [
        ...rs.slice(-6),
        { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY },
      ]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Deep water orbs */}
      <div
        className="absolute -top-32 -left-32 h-[560px] w-[560px] rounded-full animate-water-drift"
        style={{ background: "radial-gradient(circle, rgba(40,80,210,0.38), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 -right-32 h-[580px] w-[580px] rounded-full animate-water-drift"
        style={{
          background: "radial-gradient(circle, rgba(20,170,200,0.3), transparent 70%)",
          animationDelay: "-14s",
        }}
      />
      {/* Mid-depth glow */}
      <div
        className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-water-drift"
        style={{
          background: "radial-gradient(circle, rgba(60,120,220,0.18), transparent 70%)",
          animationDelay: "-5s",
        }}
      />
      {/* Rain drops */}
      {drops.map((d, i) => (
        <div
          key={i}
          className="absolute top-0 animate-rain-fall"
          style={{
            left:              d.left,
            width:             `${d.width}px`,
            height:            d.height,
            background:
              "linear-gradient(to bottom, transparent, rgba(140,210,255,0.65), transparent)",
            opacity:           d.opacity,
            animationDelay:    d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
      {/* Bottom wave shimmer */}
      <div
        className="absolute bottom-0 inset-x-0 h-28 animate-wave-pulse"
        style={{
          background:
            "linear-gradient(to top, rgba(20,90,180,0.28), rgba(20,130,200,0.10), transparent)",
        }}
      />
      {/* Click ripples */}
      {ripples.map((rip) => (
        <div
          key={rip.id}
          className="absolute animate-water-ripple-click"
          style={{
            left:         rip.x,
            top:          rip.y,
            transform:    "translate(-50%, -50%)",
            width:        "4px",
            height:       "4px",
            borderRadius: "50%",
            border:       "2px solid rgba(140,210,255,0.7)",
            pointerEvents: "none",
          }}
          onAnimationEnd={() =>
            setRipples((rs) => rs.filter((r) => r.id !== rip.id))
          }
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FLOWER GARDEN — falling petals, pollen, botanicals
   ───────────────────────────────────────────────────────────────────────── */
function FlowerScene() {
  const petalColors = [
    "rgba(240,165,185,0.72)",
    "rgba(210,155,200,0.68)",
    "rgba(232,190,215,0.70)",
    "rgba(255,180,195,0.65)",
    "rgba(195,170,210,0.70)",
  ];
  const petals = Array.from({ length: 20 }, (_, i) => ({
    left:     `${pr(i * 17 + 1) * 100}%`,
    delay:    `${pr(i * 17 + 2) * 18}s`,
    duration: `${7 + pr(i * 17 + 3) * 9}s`,
    size:     10 + pr(i * 17 + 4) * 16,
    color:    petalColors[i % petalColors.length],
    rotStart: pr(i * 17 + 5) * 360,
    drift:    (pr(i * 17 + 6) - 0.5) * 120,
  }));

  const pollen = Array.from({ length: 28 }, (_, i) => ({
    left:     `${pr(i * 19 + 7) * 100}%`,
    top:      `${30 + pr(i * 19 + 8) * 65}%`,
    size:     1.5 + pr(i * 19 + 9) * 2.5,
    delay:    `${pr(i * 19 + 10) * 12}s`,
    duration: `${9 + pr(i * 19 + 11) * 10}s`,
    opacity:  0.35 + pr(i * 19 + 12) * 0.45,
  }));

  return (
    <>
      {/* Dappled garden light */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 82% 10%, rgba(240,150,175,0.25), transparent 42%), " +
            "radial-gradient(circle at 15% 88%, rgba(155,205,148,0.22), transparent 48%), " +
            "radial-gradient(circle at 50% 50%, rgba(255,240,225,0.28), transparent 58%)",
        }}
      />
      {/* Botanical corner decorations */}
      <div className="absolute -top-2 -right-2 w-52 animate-float-blossom-a opacity-85">
        <BlossomCluster />
      </div>
      <div className="absolute bottom-20 -left-2 w-44 animate-float-blossom-b opacity-80">
        <LeafSprig />
      </div>
      {/* Scattered accent botanicals */}
      <div className="absolute top-1/4 left-4 w-10 animate-botanicals-float opacity-20" style={{ animationDelay: "-2s" }}>
        <SinglePetal />
      </div>
      <div className="absolute top-2/3 right-8 w-14 animate-botanicals-float opacity-18" style={{ animationDelay: "-5s" }}>
        <BuddingBranch />
      </div>
      {/* Falling petals */}
      {petals.map((p, i) => (
        <div
          key={i}
          className="absolute top-0 animate-petal-fall-slow"
          style={{
            left:              p.left,
            animationDelay:    p.delay,
            animationDuration: p.duration,
            width:             `${p.size}px`,
            height:            `${p.size}px`,
            backgroundColor:   p.color,
            borderRadius:      "50% 15%",
            transform:         `rotate(${p.rotStart}deg)`,
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
            left:              p.left,
            top:               p.top,
            width:             `${p.size}px`,
            height:            `${p.size}px`,
            backgroundColor:   `rgba(255,215,80,${p.opacity})`,
            animationDelay:    p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   RETRO — arcade grid, CRT scanlines, neon particles
   ───────────────────────────────────────────────────────────────────────── */
function RetroScene() {
  const particles = Array.from({ length: 14 }, (_, i) => ({
    left:     `${pr(i * 23 + 1) * 100}%`,
    top:      `${pr(i * 23 + 2) * 100}%`,
    size:     (Math.floor(pr(i * 23 + 3) * 4) + 1) * 2,
    delay:    `${pr(i * 23 + 4) * 10}s`,
    duration: `${5 + pr(i * 23 + 5) * 9}s`,
    color:
      i % 3 === 0
        ? "rgba(255,75,25,0.65)"
        : i % 3 === 1
        ? "rgba(200,165,0,0.65)"
        : "rgba(25,220,150,0.5)",
  }));

  return (
    <>
      {/* Perspective grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,30,95,0.42) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(20,30,95,0.42) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* CRT scanlines — thin repeating lines */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)",
        }}
      />
      {/* Neon sweep line */}
      <div
        className="absolute inset-x-0 top-0 h-px animate-neon-sweep opacity-70"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,75,25,0.9) 50%, transparent 100%)",
        }}
      />
      {/* Corner glow — accent orange */}
      <div
        className="absolute bottom-0 left-0 h-48 w-48"
        style={{
          background:
            "radial-gradient(circle at bottom left, rgba(255,75,25,0.16), transparent 70%)",
        }}
      />
      <div
        className="absolute top-0 right-0 h-40 w-40"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(200,165,0,0.14), transparent 70%)",
        }}
      />
      {/* Floating pixel particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute animate-pixel-drift"
          style={{
            left:              p.left,
            top:               p.top,
            width:             `${p.size}px`,
            height:            `${p.size}px`,
            backgroundColor:   p.color,
            imageRendering:    "pixelated",
            animationDelay:    p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FOREST — fireflies, moonbeams, moonlit canopy
   ───────────────────────────────────────────────────────────────────────── */
function ForestScene() {
  const fireflies = Array.from({ length: 22 }, (_, i) => ({
    left:          `${12 + pr(i * 29 + 1) * 76}%`,
    top:           `${25 + pr(i * 29 + 2) * 58}%`,
    size:          1.8 + pr(i * 29 + 3) * 3,
    wanderDelay:   `${pr(i * 29 + 4) * 10}s`,
    wanderDur:     `${6 + pr(i * 29 + 5) * 12}s`,
    glowDelay:     `${pr(i * 29 + 6) * 4}s`,
    glowDur:       `${1.4 + pr(i * 29 + 7) * 2.2}s`,
    dx:            (pr(i * 29 + 8) - 0.5) * 90,
    dy:            (pr(i * 29 + 9) - 0.5) * 70,
  }));

  return (
    <>
      {/* Canopy moonlight wash */}
      <div
        className="absolute left-1/2 -top-40 h-[620px] w-[620px] -translate-x-1/2 rounded-full animate-moonlight-breath"
        style={{
          background:
            "radial-gradient(circle, rgba(155,240,175,0.20), transparent 70%)",
        }}
      />
      {/* Moon */}
      <div className="absolute top-10 right-18 w-20 h-20 animate-moon-glow-pulse" style={{ right: "4.5rem" }}>
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 38% 35%, rgba(210,248,220,1), rgba(170,230,190,0.65) 55%, transparent 80%)",
            boxShadow:
              "0 0 28px 12px rgba(150,230,175,0.18), 0 0 70px 35px rgba(120,210,150,0.08)",
          }}
        />
      </div>
      {/* Moonbeam shaft — angled light ray */}
      <div
        className="absolute top-0 right-24 w-20 h-full animate-moonbeam-sway opacity-[0.06]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(180,248,195,0.9), transparent 80%)",
          transformOrigin: "top center",
          transform: "rotate(-9deg)",
        }}
      />
      <div
        className="absolute top-0 right-40 w-10 h-3/4 animate-moonbeam-sway opacity-[0.04]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(180,248,195,0.7), transparent 70%)",
          transformOrigin: "top center",
          transform: "rotate(-12deg)",
          animationDelay: "-3s",
        }}
      />
      {/* Ground mist */}
      <div
        className="absolute bottom-0 inset-x-0 h-32 animate-wave-pulse opacity-60"
        style={{
          background:
            "linear-gradient(to top, rgba(10,38,18,0.6), rgba(20,60,35,0.15), transparent)",
          animationDuration: "8s",
        }}
      />
      {/* Fireflies */}
      {fireflies.map((f, i) => (
        <div
          key={i}
          className="absolute animate-firefly-wander"
          style={{
            left:              f.left,
            top:               f.top,
            animationDelay:    f.wanderDelay,
            animationDuration: f.wanderDur,
            ["--ff-dx" as string]: `${f.dx}px`,
            ["--ff-dy" as string]: `${f.dy}px`,
          }}
        >
          <div
            className="rounded-full animate-firefly-blink"
            style={{
              width:             `${f.size}px`,
              height:            `${f.size}px`,
              backgroundColor:   "rgba(185,255,155,0.95)",
              boxShadow:         `0 0 ${f.size * 4}px ${f.size * 1.5}px rgba(150,255,130,0.35)`,
              animationDelay:    f.glowDelay,
              animationDuration: f.glowDur,
            }}
          />
        </div>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   BOTANICAL SVG ILLUSTRATIONS (shared between Flower scenes)
   ───────────────────────────────────────────────────────────────────────── */
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
      {([[30, 95, -30],[42, 80, -25],[55, 65, -20],[68, 52, -15],[80, 40, -10]] as [number,number,number][]).map(([cx, cy, rot], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="10" ry="5" fill="#8aa882" opacity="0.85" transform={`rotate(${rot} ${cx} ${cy})`} />
      ))}
      {([[35, 100, 30],[48, 85, 25],[62, 70, 20],[74, 56, 15]] as [number,number,number][]).map(([cx, cy, rot], i) => (
        <ellipse key={`r${i}`} cx={cx} cy={cy} rx="9" ry="4.5" fill="#a3bf9b" opacity="0.8" transform={`rotate(${rot} ${cx} ${cy})`} />
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

/* ─────────────────────────────────────────────────────────────────────────
   FLOWER REVEAL PETALS — used on gift.$id when theme === "flower"
   ───────────────────────────────────────────────────────────────────────── */
export function FlowerRevealPetals() {
  const petals = [
    { left: "18%", delay: "0s",    drift: "35px"  },
    { left: "62%", delay: "0.22s", drift: "-28px" },
    { left: "42%", delay: "0.45s", drift: "12px"  },
    { left: "76%", delay: "0.65s", drift: "-18px" },
    { left: "30%", delay: "0.85s", drift: "22px"  },
  ];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {petals.map((p, i) => (
        <div
          key={i}
          className="absolute top-0 w-7 animate-petal-drift"
          style={{
            left:           p.left,
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
