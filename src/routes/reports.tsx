import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Download, TrendingUp, TrendingDown, Pill, HeartPulse, CheckSquare } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & History — CareCircle" }] }),
  component: ReportsPage,
});

const PAIN = [3, 4, 2, 5, 6, 4, 3, 4, 2, 3, 5, 4, 3, 2];
const ADHERENCE = 92;

function ReportsPage() {
  const max = 10;
  return (
    <AppShell>
      <PageHeader
        title="Reports & history"
        subtitle="Trends over the past 14 days. Share with your physician anytime."
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-input bg-card hover:bg-muted font-semibold">
            <Download className="size-4" /> Export PDF
          </button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <KPI icon={Pill} label="Medication adherence" value={`${ADHERENCE}%`} delta="+3% vs last period" up />
        <KPI icon={HeartPulse} label="Avg pain rating" value="3.6" delta="-0.8 vs last period" up={false} good />
        <KPI icon={CheckSquare} label="Tasks completed" value="48 / 52" delta="92% completion" up />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-display font-bold text-lg">Pain trend (14 days)</h2>
          <p className="text-sm text-muted-foreground">Self-reported scale 0–10.</p>
          <div className="mt-6 flex items-end justify-between gap-2 h-48">
            {PAIN.map((p, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary/30 to-primary"
                  style={{ height: `${(p / max) * 100}%` }}
                  title={`Day ${i + 1}: ${p}`}
                />
                <span className="text-[10px] text-muted-foreground">{i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-display font-bold text-lg">Medication adherence</h2>
          <p className="text-sm text-muted-foreground">Doses taken on time.</p>
          <div className="mt-6 flex items-center gap-6">
            <RingChart value={ADHERENCE} />
            <ul className="flex-1 space-y-2 text-sm">
              {[
                { name: "Lisinopril", v: 100 },
                { name: "Metformin", v: 88 },
                { name: "Atorvastatin", v: 78 },
                { name: "Vitamin D3", v: 100 },
              ].map((r) => (
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
            </ul>
          </div>
        </section>

        <section className="lg:col-span-2 rounded-2xl bg-card border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-display font-bold text-lg">Care history</h2>
          </div>
          <ul className="divide-y divide-border">
            {[
              { date: "Jun 7, 2026", summary: "Pain flare in afternoon (6/10). Extra rest taken.", tag: "Pain event" },
              { date: "Jun 5, 2026", summary: "Routine visit — Dr. Hall. BP 128/82.", tag: "Appointment" },
              { date: "Jun 3, 2026", summary: "Started Vitamin D3 supplement.", tag: "Medication" },
              { date: "May 30, 2026", summary: "Blood work completed at Lab Plus.", tag: "Appointment" },
            ].map((e) => (
              <li key={e.date} className="px-6 py-4 flex items-center gap-4">
                <div className="text-sm font-semibold w-32 shrink-0">{e.date}</div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{e.summary}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{e.tag}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  delta,
  up,
  good,
}: {
  icon: typeof Pill;
  label: string;
  value: string;
  delta: string;
  up: boolean;
  good?: boolean;
}) {
  // For pain, going down is good. We invert the color via 'good' flag.
  const positive = good ? !up : up;
  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center justify-between">
        <span className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
          <Icon className="size-5" />
        </span>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${positive ? "text-success" : "text-destructive"}`}>
          {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          {delta}
        </span>
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function RingChart({ value }: { value: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative size-32 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} className="stroke-muted" strokeWidth="10" fill="none" />
        <circle
          cx="50" cy="50" r={r}
          className="stroke-primary"
          strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-2xl font-bold">{value}%</span>
      </div>
    </div>
  );
}
