import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({ query: z.string().min(1).max(200) });

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

async function ytSearch(query: string, apiKey: string): Promise<YouTubeSearchResult | null> {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        channelTitle?: string;
        thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
      };
    }>;
  };
  const item = data.items?.[0];
  const videoId = item?.id?.videoId;
  if (!videoId) return null;
  return {
    videoId,
    title: item?.snippet?.title ?? "",
    channelTitle: item?.snippet?.channelTitle ?? "",
    thumbnail:
      item?.snippet?.thumbnails?.medium?.url ??
      item?.snippet?.thumbnails?.default?.url ??
      `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
  };
}

export const findYouTubeMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "Auto-match unavailable. Paste a link, or" };
    }
    try {
      const primary = await ytSearch(`${data.query} official audio`, apiKey);
      if (primary) return { ok: true as const, result: primary };
      const fallback = await ytSearch(`${data.query} official video`, apiKey);
      if (fallback) return { ok: true as const, result: fallback };
      const bare = await ytSearch(data.query, apiKey);
      if (bare) return { ok: true as const, result: bare };
      return { ok: false as const, error: "No YouTube match found." };
    } catch {
      return { ok: false as const, error: "Auto-match unavailable. Paste a link, or" };
    }
  });
