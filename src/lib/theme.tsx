import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme =
  | "parchment"
  | "midnight"
  | "liquid"
  | "flower"
  | "autumn"
  | "winter"
  | "aurora"
  | "fire"
  | "bamboo";

export const THEMES: { id: Theme; label: string; emoji: string; blurb: string }[] = [
  {
    id: "parchment",
    label: "Parchment",
    emoji: "📜",
    blurb: "Aged manuscript, candlelight, floating dust.",
  },
  {
    id: "midnight",
    label: "Midnight",
    emoji: "🌙",
    blurb: "Cosmic night — stars, moon, meteor showers.",
  },
  { id: "liquid", label: "Rain", emoji: "🌧️", blurb: "Rainfall, ripples, deep water, mist." },
  { id: "flower", label: "Garden", emoji: "🌸", blurb: "Falling petals, butterflies, pollen." },
  {
    id: "autumn",
    label: "Autumn",
    emoji: "🍂",
    blurb: "Drifting maple leaves, golden amber glow.",
  },
  { id: "winter", label: "Winter", emoji: "❄️", blurb: "Falling snow, frost crystals, icy mist." },
  { id: "aurora", label: "Aurora", emoji: "🌌", blurb: "Northern lights, mountains, night sky." },
  { id: "fire", label: "Fire", emoji: "🔥", blurb: "Embers, flames, lava glow, heat shimmer." },
  { id: "bamboo", label: "Zen", emoji: "🎋", blurb: "Bamboo forest, mist, flowing stream." },
];

const STORAGE_KEY = "musicophile-theme";
const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "parchment",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("parchment");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved && THEMES.some((t) => t.id === saved)) setThemeState(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
  }

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
