export interface ITunesTrack {
  trackId?: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  collectionName?: string;
}

interface ITunesResponse {
  resultCount: number;
  results: ITunesTrack[];
}

export async function searchITunes(term: string, limit = 20): Promise<ITunesTrack[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("iTunes search failed");
  const data: ITunesResponse = await res.json();
  return (data.results || []).filter((t) => t.trackName && t.artistName);
}

export function upgradeArtwork(url?: string | null, size = 600): string | undefined {
  if (!url) return undefined;
  return url.replace(/\/\d+x\d+bb\.(jpg|png)$/, `/${size}x${size}bb.$1`);
}
