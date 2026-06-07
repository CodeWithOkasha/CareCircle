import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Shared Calendar — CareCircle" }] }),
  component: CalendarPage,
});

type Event = { day: number; title: string; time: string; type: "med" | "appt" | "task" | "visit" };

const EVENTS: Event[] = [
  { day: 3, title: "Dr. Hall visit", time: "10:00", type: "appt" },
  { day: 7, title: "Pharmacy refill", time: "All day", type: "task" },
  { day: 10, title: "Physiotherapy", time: "14:00", type: "appt" },
  { day: 12, title: "Emma's visit", time: "16:00", type: "visit" },
  { day: 15, title: "Blood work", time: "09:30", type: "appt" },
  { day: 18, title: "Daily walk", time: "11:00", type: "task" },
  { day: 22, title: "Cardiology follow-up", time: "13:30", type: "appt" },
  { day: 25, title: "Daniel's visit", time: "All day", type: "visit" },
];

const TYPE_STYLES: Record<Event["type"], string> = {
  med: "bg-info/15 text-info border-info/30",
  appt: "bg-primary/15 text-primary border-primary/30",
  task: "bg-warning/20 text-warning-foreground border-warning/30",
  visit: "bg-accent/40 text-accent-foreground border-accent/40",
};

function CalendarPage() {
  // June 2026 — June 1 is a Monday (we'll display Sun start)
  const firstWeekday = 1; // Monday index in Sun-start grid
  const daysInMonth = 30;
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <AppShell>
      <PageHeader
        title="Shared Calendar"
        subtitle="Appointments, visits, and care events for everyone in the circle."
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90">
            <Plus className="size-4" /> New event
          </button>
        }
      />

      <div className="rounded-2xl bg-card border border-border p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-bold">June 2026</h2>
          <div className="flex items-center gap-1">
            <button className="size-10 rounded-xl hover:bg-muted grid place-items-center"><ChevronLeft className="size-5" /></button>
            <button className="px-3 h-10 rounded-xl border border-input hover:bg-muted text-sm font-medium">Today</button>
            <button className="size-10 rounded-xl hover:bg-muted grid place-items-center"><ChevronRight className="size-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="bg-muted/60 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>
          ))}
          {cells.map((day, idx) => {
            const dayEvents = day ? EVENTS.filter((e) => e.day === day) : [];
            const isToday = day === 7;
            return (
              <div key={idx} className="bg-card min-h-24 sm:min-h-32 p-2 flex flex-col gap-1">
                {day && (
                  <span className={`text-sm font-semibold size-7 grid place-items-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                    {day}
                  </span>
                )}
                <div className="flex flex-col gap-1 mt-1">
                  {dayEvents.map((e) => (
                    <span key={e.title} className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md border truncate ${TYPE_STYLES[e.type]}`}>
                      <span className="hidden sm:inline">{e.time} · </span>{e.title}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {[
            { cls: "bg-primary/40 border-primary/50", label: "Appointment" },
            { cls: "bg-info/40 border-info/50", label: "Medication" },
            { cls: "bg-warning/40 border-warning/50", label: "Task" },
            { cls: "bg-accent border-accent", label: "Visit" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-2">
              <span className={`size-3 rounded-sm border ${l.cls}`} />
              {l.label}
            </span>
          ))}
        </div>

      </div>
    </AppShell>
  );
}
