import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader, RoleBadge, appRoleToLabel } from "@/components/app-shell";
import { Pill, CheckSquare, CalendarDays, Activity, ArrowUpRight, HeartPulse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCircle } from "@/hooks/use-circle";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CareCircle" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { circle, members } = useCircle();
  const { profile } = useAuth();
  const qc = useQueryClient();

  const { data: counts } = useQuery({
    queryKey: ["dashboard-counts", circle?.id],
    enabled: !!circle,
    queryFn: async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const [tasks, meds, appts, feed] = await Promise.all([
        supabase.from("tasks").select("id, status", { count: "exact" }).eq("circle_id", circle!.id),
        supabase.from("medications").select("id", { count: "exact" }).eq("circle_id", circle!.id),
        supabase.from("appointments").select("id", { count: "exact" }).eq("circle_id", circle!.id).gte("starts_at", today.toISOString()),
        supabase.from("feed_posts").select("id", { count: "exact" }).eq("circle_id", circle!.id).gte("created_at", today.toISOString()),
      ]);
      return {
        tasks: tasks.data?.filter((t) => t.status !== "done").length ?? 0,
        meds: meds.count ?? 0,
        appts: appts.count ?? 0,
        feed: feed.count ?? 0,
      };
    },
  });

  const { data: recentTasks = [] } = useQuery({
    queryKey: ["dashboard-recent-tasks", circle?.id],
    enabled: !!circle,
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("id, title, status, assignee_id, due_at").eq("circle_id", circle!.id).order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  useRealtime(
    `dash:${circle?.id ?? "none"}`,
    circle ? [
      { table: "tasks", filter: `circle_id=eq.${circle.id}` },
      { table: "medications", filter: `circle_id=eq.${circle.id}` },
      { table: "appointments", filter: `circle_id=eq.${circle.id}` },
      { table: "feed_posts", filter: `circle_id=eq.${circle.id}` },
    ] : [],
    () => {
      qc.invalidateQueries({ queryKey: ["dashboard-counts", circle?.id] });
      qc.invalidateQueries({ queryKey: ["dashboard-recent-tasks", circle?.id] });
    },
  );

  const stats = [
    { label: "Open tasks", value: counts?.tasks ?? 0, icon: CheckSquare },
    { label: "Medications", value: counts?.meds ?? 0, icon: Pill },
    { label: "Upcoming events", value: counts?.appts ?? 0, icon: CalendarDays },
    { label: "Updates today", value: counts?.feed ?? 0, icon: Activity },
  ];

  return (
    <AppShell>
      <PageHeader
        title={`Hello, ${profile?.full_name?.split(" ")[0] ?? "there"}`}
        subtitle={circle ? `Here's what's happening in ${circle.name}.` : "Setting up your circle…"}
        action={
          <Link to="/patient" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90">
            <HeartPulse className="size-4" /> Open Patient Mode
          </Link>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="size-9 rounded-xl bg-primary-soft text-primary grid place-items-center">
                <s.icon className="size-4" />
              </span>
            </div>
            <div className="mt-3 text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <section className="lg:col-span-2 rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Recent tasks</h2>
            <Link to="/tasks" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ul className="space-y-3">
            {recentTasks.map((t) => {
              const who = members.find((m) => m.user_id === t.assignee_id)?.profile?.full_name ?? "Unassigned";
              return (
                <li key={t.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/60">
                  <div className={`size-2.5 rounded-full ${t.status === "done" ? "bg-success" : "bg-border"}`} />
                  <div className="flex-1">
                    <div className={`font-medium ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                    <div className="text-xs text-muted-foreground">Assigned to {who}</div>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{t.status.replace("_", " ")}</span>
                </li>
              );
            })}
            {recentTasks.length === 0 && <li className="text-sm text-muted-foreground text-center py-6">No tasks yet.</li>}
          </ul>
        </section>

        <section className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-display text-xl font-bold mb-4">Your circle</h2>
          <ul className="space-y-3">
            {members.map((m) => {
              const name = m.profile?.full_name ?? "Member";
              const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <li key={m.id} className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-secondary grid place-items-center font-semibold text-secondary-foreground">{initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{name}</div>
                  </div>
                  <RoleBadge role={appRoleToLabel(m.role)} />
                </li>
              );
            })}
          </ul>
          <Link to="/circle" className="mt-4 block text-center w-full px-4 py-2.5 rounded-xl bg-muted hover:bg-secondary text-sm font-medium">
            Manage circle
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
