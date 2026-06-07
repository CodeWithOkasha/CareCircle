import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCircle } from "@/hooks/use-circle";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ title: "Activity — CareCircle" }] }),
  component: ActivityPage,
});

type Post = { id: string; author_id: string; content: string; category: string | null; created_at: string };

function ActivityPage() {
  const { circle, members } = useCircle();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [content, setContent] = useState("");

  const { data: posts = [] } = useQuery({
    queryKey: ["feed_posts", circle?.id],
    enabled: !!circle,
    queryFn: async () => {
      const { data } = await supabase.from("feed_posts").select("*").eq("circle_id", circle!.id).order("created_at", { ascending: false }).limit(50);
      return (data ?? []) as Post[];
    },
  });

  useRealtime(
    `feed:${circle?.id ?? "none"}`,
    circle ? [{ table: "feed_posts", filter: `circle_id=eq.${circle.id}` }] : [],
    () => qc.invalidateQueries({ queryKey: ["feed_posts", circle?.id] }),
  );

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!circle || !user || !content.trim()) return;
    await supabase.from("feed_posts").insert({ circle_id: circle.id, author_id: user.id, content: content.trim() });
    setContent("");
  }

  return (
    <AppShell>
      <PageHeader title="Activity feed" subtitle="A live timeline of what's happening across your circle." />

      <form onSubmit={post} className="mb-6 rounded-2xl border border-border bg-card p-4 flex gap-3">
        <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share an update with your circle…" className="flex-1 h-11 rounded-xl border border-input bg-background px-3" />
        <button type="submit" className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-primary text-primary-foreground font-semibold">
          <Send className="size-4" /> Post
        </button>
      </form>

      <div className="rounded-2xl bg-card border border-border p-4 sm:p-6">
        <ol className="relative space-y-1">
          <span className="absolute left-5 top-3 bottom-3 w-px bg-border" aria-hidden />
          {posts.map((p) => {
            const author = members.find((m) => m.user_id === p.author_id)?.profile?.full_name ?? "Member";
            return (
              <li key={p.id} className="relative pl-14 py-3">
                <span className="absolute left-1 top-3 size-9 rounded-full grid place-items-center ring-4 ring-card bg-primary text-primary-foreground">
                  <MessageCircle className="size-4" />
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{author}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(p.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-foreground/80 mt-1">{p.content}</p>
              </li>
            );
          })}
          {posts.length === 0 && <li className="text-center text-sm text-muted-foreground py-10">No activity yet — be the first to post.</li>}
        </ol>
      </div>
    </AppShell>
  );
}
