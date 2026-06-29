// Extract a YouTube video ID from common URL formats.
export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const s = input.trim();
  // Bare 11-char id
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try {
    const url = new URL(s.startsWith("http") ? s : `https://${s}`);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host === "music.youtube.com") {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      // /embed/ID or /shorts/ID
      const parts = url.pathname.split("/").filter(Boolean);
      const i = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "v");
      if (i >= 0 && parts[i + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[i + 1])) return parts[i + 1];
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeSearchUrl(track: string, artist: string): string {
  const q = encodeURIComponent(`${track} ${artist}`);
  return `https://www.youtube.com/results?search_query=${q}`;
}
