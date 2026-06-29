import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeBackground } from "@/components/ThemeBackground";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  const [unread, setUnread] = useState(0);

  async function refresh() {
    const { count } = await supabase
      .from("gifts")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .is("read_at", null);
    setUnread(count ?? 0);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const ch = supabase
      .channel(`unread-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gifts", filter: `recipient_id=eq.${user.id}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user.id]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <ThemeBackground />
      <main className="pb-24">
        <Outlet />
      </main>
      <BottomNav unread={unread} />
    </div>
  );
}

function BottomNav({ unread }: { unread: number }) {
  const linkBase =
    "relative px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground";
  const active = "text-foreground";
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around py-3">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          className={linkBase}
          activeProps={{ className: `${linkBase} ${active}` }}
        >
          Inbox
          {unread > 0 && (
            <span
              className="absolute -top-0.5 -right-1 inline-flex h-2 w-2 rounded-full bg-accent"
              aria-label={`${unread} unread`}
            />
          )}
        </Link>
        <Link to="/sent" className={linkBase} activeProps={{ className: `${linkBase} ${active}` }}>
          Sent
        </Link>
        <Link
          to="/friends"
          className={linkBase}
          activeProps={{ className: `${linkBase} ${active}` }}
        >
          Friends
        </Link>
        <Link
          to="/settings"
          className={linkBase}
          activeProps={{ className: `${linkBase} ${active}` }}
        >
          Settings
        </Link>
      </div>
    </nav>
  );
}
