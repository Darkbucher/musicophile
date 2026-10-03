export const EMOJI_REACTIONS = ["❤️", "🥺", "✨", "😭", "🕊️", "🔥", "🎉", "☕"] as const;

export type EmojiReaction = (typeof EMOJI_REACTIONS)[number];

/**
 * Extracts emoji reaction from track_id (e.g. "12345|rx:❤️" -> "❤️")
 */
export function getReaction(track_id?: string | null): string | null {
  if (!track_id) return null;
  const match = track_id.match(/rx:([^\s|]+)/);
  return match ? match[1] : null;
}

/**
 * Encodes emoji reaction into track_id while preserving any existing iTunes track ID
 */
export function setReactionInTrackId(track_id: string | null | undefined, emoji: string): string {
  const clean = (track_id || "")
    .replace(/rx:[^\s|]+/g, "")
    .replace(/\|+/g, "|")
    .replace(/^\||\|$/g, "")
    .trim();

  return clean ? `${clean}|rx:${emoji}` : `rx:${emoji}`;
}
