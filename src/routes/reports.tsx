import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Pill, HeartPulse, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCircle } from "@/hooks/use-circle";
import { useRealtime } from "@/hooks/use-realtime";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & History — CareCircle" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { circle } = useCircle();
  const qc = useQueryClient();
  const since = new Date(); since.setDate(since.getDate() - 14); since.setHours(0, 0, 0, 0);

  const { data } = useQuery({
    queryKey: ["reports", circle?.id],
    enabled: !!circle,
    queryFn: async () => {
      const [moods, logs, meds, tasks] = await Promise.all([
        supabase.from("patient_moods").select("pain_level, created_at").eq("circle_id", circle!.id).gte("created_at", since.toISOString()).order("created_at"),
        supabase.from("medication_logs").select("id, medication_id, taken_at").eq("circle_id", circle!.id).gte("taken_at", since.toISOString()),
        supabase.from("medications").select("id, name").eq("circle_id", circle!.id),
        supabase.from("tasks").select("id, status").eq("circle_id", circle!.id),
      ]);
      // Daily avg pain over last 14 days
      const days: number[] = Array(14).fill(0);
      const counts: number[] = Array(14).fill(0);
      (moods.data ?? []).forEach((m) => {
        if (m.pain_level == null) return;
        const dayIdx = Math.floor((Date.now() - new Date(m.created_at).getTime()) / 86400000);
        if (dayIdx >= 0 && dayIdx < 14) { days[13 - dayIdx] += m.pain_level; counts[13 - dayIdx]++; }
      });
      const pain = days.map((s, i) => (counts[i] ? s / counts[i] : 0));
      const avgPain = pain.filter((p) => p > 0).reduce((a, b) => a + b, 0) / Math.max(1, pain.filter((p) => p > 0).length);

      const totalTasks = tasks.data?.length ?? 0;
      const doneTasks = tasks.data?.filter((t) => t.status === "done").length ?? 0;

      // Adherence per med: doses logged / (14 days * expected) — simplified to logged-count
      const adherenceRows = (meds.data ?? []).map((m) => {
        const count = (logs.data ?? []).filter((l) => l.medication_id === m.id).length;
        const expected = 14; // assume daily
        return { name: m.name, v: Math.min(100, Math.round((count / expected) * 100)) };
      });
      const overallAdherence = adherenceRows.length ? Math.round(adherenceRows.reduce((s, r) => s + r.v, 0) / adherenceRows.length) : 0;

      return { pain, avgPain, totalTasks, doneTasks, adherenceRows, overallAdherence };
    },
  });

  useRealtime(
    `reports:${circle?.id ?? "none"}`,
    circle ? [
      { table: "patient_moods", filter: `circle_id=eq.${circle.id}` },
      { table: "medication_logs", filter: `circle_id=eq.${circle.id}` },
      { table: "medications", filter: `circle_id=eq.${circle.id}` },
      { table: "tasks", filter: `circle_id=eq.${circle.id}` },
    ] : [],
    () => qc.invalidateQueries({ queryKey: ["reports", circle?.id] }),
  );

  const pain = data?.pain ?? Array(14).fill(0);

  return (
    <AppShell>
      <PageHeader title="Reports & history" subtitle="Trends over the past 14 days." />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <KPI icon={Pill} label="Medication adherence" value={`${data?.overallAdherence ?? 0}%`} />
        <KPI icon={HeartPulse} label="Avg pain rating" value={data?.avgPain ? data.avgPain.toFixed(1) : "—"} />
        <KPI icon={CheckSquare} label="Tasks completed" value={`${data?.doneTasks ?? 0} / ${data?.totalTasks ?? 0}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-display font-bold text-lg">Pain trend (14 days)</h2>
          <div className="mt-6 flex items-end justify-between gap-2 h-48">
            {pain.map((p, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-primary/30 to-primary" style={{ height: `${(p / 10) * 100}%` }} title={`${p.toFixed(1)}`} />
                <span className="text-[10px] text-muted-foreground">{i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-display font-bold text-lg">Medication adherence</h2>
          <ul className="mt-6 space-y-3 text-sm">
            {(data?.adherenceRows ?? []).map((r) => (
              <li key={r.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-muted-foreground tabular-nums">{r.v}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${r.v}%` }} />
                </div>
              </li>
            ))}
            {(!data?.adherenceRows.length) && <li className="text-muted-foreground text-center py-6">No medications tracked yet.</li>}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

function KPI({ icon: Icon, label, value }: { icon: typeof Pill; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center justify-between">
        <span className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
          <Icon className="size-5" />
        </span>
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
