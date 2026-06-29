import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "parchment" | "midnight" | "liquid" | "flower" | "retro" | "forest";

export const THEMES: { id: Theme; label: string; emoji: string; blurb: string }[] = [
  { id: "parchment", label: "Parchment", emoji: "📜", blurb: "Aged manuscript, dust motes, warm candlelight." },
  { id: "midnight", label: "Midnight", emoji: "🌙", blurb: "Cosmic night — stars, moon, shooting meteors." },
  { id: "liquid",   label: "Liquid",   emoji: "🌧️", blurb: "Rainfall, deep water, ripples on click." },
  { id: "flower",   label: "Flower",   emoji: "🌸", blurb: "Falling petals, pollen, blooming garden." },
  { id: "retro",    label: "Retro",    emoji: "👾", blurb: "Arcade grid, CRT scanlines, neon glow." },
  { id: "forest",   label: "Forest",   emoji: "🌲", blurb: "Fireflies, moonbeams, ancient canopy." },
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
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
  }

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
