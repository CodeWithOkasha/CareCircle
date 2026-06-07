import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader, RoleBadge } from "@/components/app-shell";
import { Pill, CheckSquare, CalendarDays, Activity, ArrowUpRight, HeartPulse, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CareCircle" }] }),
  component: Dashboard,
});

const STATS = [
  { label: "Today's tasks", value: "8", trend: "+2 since yesterday", icon: CheckSquare, tone: "primary" },
  { label: "Medications due", value: "4", trend: "Next at 2:00 PM", icon: Pill, tone: "info" },
  { label: "Upcoming events", value: "3", trend: "This week", icon: CalendarDays, tone: "accent" },
  { label: "Circle activity", value: "12", trend: "Updates today", icon: Activity, tone: "success" },
] as const;

function Dashboard() {
  return (
    <AppShell>
      <PageHeader
        title="Good afternoon, Sarah"
        subtitle="Here's what's happening in Mom's care circle today."
        action={
          <Link
            to="/patient"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90"
          >
            <HeartPulse className="size-4" /> Open Patient Mode
          </Link>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="size-9 rounded-xl bg-primary-soft text-primary grid place-items-center">
                <s.icon className="size-4" />
              </span>
            </div>
            <div className="mt-3 text-3xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <section className="lg:col-span-2 rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Today's plan</h2>
            <Link to="/tasks" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ul className="space-y-3">
            {[
              { time: "08:00", title: "Morning medications", who: "Daniel", done: true },
              { time: "10:30", title: "Walk in the garden", who: "Sarah", done: true },
              { time: "12:00", title: "Lunch & hydration check", who: "Emma", done: false },
              { time: "14:00", title: "Afternoon medications", who: "Daniel", done: false },
              { time: "17:30", title: "Doctor video call", who: "Sarah", done: false },
            ].map((t) => (
              <li
                key={t.title}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/60 transition-colors"
              >
                <div className="text-sm font-semibold tabular-nums text-muted-foreground w-14">{t.time}</div>
                <div className={`size-2.5 rounded-full ${t.done ? "bg-success" : "bg-border"}`} />
                <div className="flex-1">
                  <div className={`font-medium ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                  <div className="text-xs text-muted-foreground">Assigned to {t.who}</div>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">{t.done ? "Done" : "Upcoming"}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-display text-xl font-bold mb-4">Your circle</h2>
          <ul className="space-y-3">
            {[
              { name: "Daniel Park", role: "Admin" as const, status: "Active now" },
              { name: "Sarah Miller", role: "Coordinator" as const, status: "You" },
              { name: "Emma Lopez", role: "Helper" as const, status: "Last seen 1h ago" },
              { name: "James Chen", role: "Helper" as const, status: "Last seen yesterday" },
            ].map((m) => (
              <li key={m.name} className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-secondary grid place-items-center font-semibold text-secondary-foreground">
                  {m.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{m.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.status}</div>
                </div>
                <RoleBadge role={m.role} />
              </li>
            ))}
          </ul>
          <Link to="/circle" className="mt-4 block text-center w-full px-4 py-2.5 rounded-xl bg-muted hover:bg-secondary text-sm font-medium">
            Manage circle
          </Link>
        </section>

        <section className="lg:col-span-3 rounded-2xl border border-accent/40 bg-accent/30 p-5 flex items-start gap-4">
          <div className="size-10 rounded-xl bg-accent grid place-items-center text-accent-foreground shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Mom rated her pain a 6 at 11:42 AM</div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Consider checking in. Daniel has been notified as the admin.
            </p>
          </div>
          <Link to="/activity" className="text-sm font-semibold text-accent-foreground hover:underline">
            See activity
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
