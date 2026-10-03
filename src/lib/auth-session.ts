import { supabase } from "@/integrations/supabase/client";

/**
 * Checks for auth codes, token hashes, or existing sessions in the URL and localStorage.
 * Handles PKCE exchange (?code=...), email verification (?token_hash=...), and hash tokens.
 */
export async function resolveAuthSession() {
  if (typeof window === "undefined") return null;

  try {
    const url = new URL(window.location.href);

    // 1. Check for PKCE auth code (?code=...)
    const code = url.searchParams.get("code");
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        url.searchParams.delete("code");
        window.history.replaceState(
          {},
          document.title,
          url.pathname + (url.search ? url.search : ""),
        );
        return data.user;
      }
    }

    // 2. Check for token_hash (?token_hash=...&type=...)
    const token_hash = url.searchParams.get("token_hash");
    const type = (url.searchParams.get("type") as any) || "magiclink";
    if (token_hash) {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (!error && data?.user) {
        url.searchParams.delete("token_hash");
        url.searchParams.delete("type");
        window.history.replaceState(
          {},
          document.title,
          url.pathname + (url.search ? url.search : ""),
        );
        return data.user;
      }
    }

    // 3. Check for hash tokens (#access_token=...&refresh_token=...)
    if (window.location.hash.includes("access_token")) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");
      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!error && data?.user) {
          window.history.replaceState(
            {},
            document.title,
            url.pathname + (url.search ? url.search : ""),
          );
          return data.user;
        }
      }
    }

    // 4. Default: fetch current session/user from storage
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return user;
  } catch (err) {
    console.error("[resolveAuthSession] Error resolving session:", err);
    return null;
  }
}
