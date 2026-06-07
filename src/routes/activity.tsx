import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, RoleBadge, type Role } from "@/components/app-shell";
import { Pill, CheckSquare, MessageCircle, AlertTriangle, Heart, Droplet } from "lucide-react";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ title: "Activity — CareCircle" }] }),
  component: ActivityPage,
});

type Event = {
  who: string;
  role: Role;
  icon: typeof Pill;
  text: string;
  time: string;
  tone?: "default" | "alert" | "success";
};

const EVENTS: Event[] = [
  { who: "Mom (Patient)", role: "Helper", icon: AlertTriangle, text: "Tapped 'I am in pain' — rated 6/10", time: "11:42 AM", tone: "alert" },
  { who: "Daniel Park", role: "Admin", icon: Pill, text: "Marked Lisinopril as taken", time: "10:15 AM", tone: "success" },
  { who: "Sarah Miller", role: "Coordinator", icon: CheckSquare, text: "Completed 'Morning walk in the garden'", time: "10:34 AM" },
  { who: "Mom (Patient)", role: "Helper", icon: Droplet, text: "Requested water", time: "10:01 AM" },
  { who: "Emma Lopez", role: "Helper", icon: MessageCircle, text: "Commented on 'Grocery run': 'Picked up soup and bread.'", time: "Yesterday, 6:12 PM" },
  { who: "Mom (Patient)", role: "Helper", icon: Heart, text: "Mood check-in: feeling calm", time: "Yesterday, 5:00 PM" },
  { who: "Daniel Park", role: "Admin", icon: Pill, text: "Added new medication: Vitamin D3 1000 IU", time: "Yesterday, 2:30 PM" },
];

function ActivityPage() {
  return (
    <AppShell>
      <PageHeader title="Activity feed" subtitle="A live timeline of what's happening across your circle." />

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="rounded-2xl bg-card border border-border p-4 sm:p-6">
          <ol className="relative space-y-1">
            <span className="absolute left-5 top-3 bottom-3 w-px bg-border" aria-hidden />
            {EVENTS.map((e, i) => {
              const toneRing =
                e.tone === "alert"
                  ? "bg-destructive text-destructive-foreground ring-destructive/30"
                  : e.tone === "success"
                  ? "bg-success text-success-foreground ring-success/30"
                  : "bg-primary text-primary-foreground ring-primary/30";
              return (
                <li key={i} className="relative pl-14 py-3">
                  <span className={`absolute left-1 top-3 size-9 rounded-full grid place-items-center ring-4 ring-card ${toneRing}`}>
                    <e.icon className="size-4" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{e.who}</span>
                    <RoleBadge role={e.role} />
                    <span className="text-xs text-muted-foreground ml-auto">{e.time}</span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-1">{e.text}</p>
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="font-display font-bold mb-3">Filter by</h3>
            <ul className="space-y-2 text-sm">
              {["All updates", "Medications", "Tasks", "Patient signals", "Comments"].map((f, i) => (
                <li key={f}>
                  <button className={`w-full text-left px-3 py-2 rounded-lg ${i === 0 ? "bg-primary-soft text-primary font-semibold" : "hover:bg-muted"}`}>
                    {f}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="font-display font-bold mb-3">Today at a glance</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Patient signals" value="3" />
              <Row label="Tasks completed" value="5" />
              <Row label="Medications given" value="2" />
              <Row label="Messages" value="4" />
            </dl>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-bold tabular-nums">{value}</dd>
    </div>
  );
}
