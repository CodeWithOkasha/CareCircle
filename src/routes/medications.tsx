import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Pill, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/medications")({
  head: () => ({ meta: [{ title: "Medications — CareCircle" }] }),
  component: MedsPage,
});

type Med = {
  name: string;
  dose: string;
  schedule: string;
  next: string;
  taken: boolean;
  refills: number;
  notes?: string;
};

const MEDS: Med[] = [
  { name: "Lisinopril", dose: "10 mg · 1 tablet", schedule: "Every morning", next: "Tomorrow 8:00 AM", taken: true, refills: 2, notes: "Take with water" },
  { name: "Metformin", dose: "500 mg · 1 tablet", schedule: "Twice daily, with meals", next: "Today 2:00 PM", taken: false, refills: 1 },
  { name: "Atorvastatin", dose: "20 mg · 1 tablet", schedule: "Evening", next: "Today 9:00 PM", taken: false, refills: 0 },
  { name: "Vitamin D3", dose: "1000 IU · 1 capsule", schedule: "Daily", next: "Today 8:00 AM", taken: true, refills: 4 },
];

function MedsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Medications"
        subtitle="Doses, schedules, and refills — all in one place."
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90">
            <Plus className="size-4" /> Add medication
          </button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Summary icon={CheckCircle2} label="Taken today" value="2 of 4" tone="success" />
        <Summary icon={Clock} label="Next dose" value="2:00 PM" tone="primary" />
        <Summary icon={AlertCircle} label="Needs refill" value="1 medication" tone="destructive" />
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">
          <div className="col-span-4">Medication</div>
          <div className="col-span-3">Schedule</div>
          <div className="col-span-2">Next dose</div>
          <div className="col-span-1">Refills</div>
          <div className="col-span-2 text-right">Status</div>
        </div>
        <ul className="divide-y divide-border">
          {MEDS.map((m) => (
            <li key={m.name} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 items-center">
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
                  <Pill className="size-5" />
                </div>
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-muted-foreground">{m.dose}</div>
                </div>
              </div>
              <div className="md:col-span-3 text-sm">{m.schedule}</div>
              <div className="md:col-span-2 text-sm font-medium">{m.next}</div>
              <div className="md:col-span-1">
                <span className={`text-sm font-bold ${m.refills === 0 ? "text-destructive" : ""}`}>{m.refills}</span>
              </div>
              <div className="md:col-span-2 md:text-right">
                {m.taken ? (
                  <span className="inline-flex items-center gap-1.5 text-success font-medium text-sm">
                    <CheckCircle2 className="size-4" /> Taken
                  </span>
                ) : (
                  <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
                    Mark taken
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Pill;
  label: string;
  value: string;
  tone: "success" | "primary" | "destructive";
}) {
  const map = {
    success: "bg-success/15 text-success",
    primary: "bg-primary-soft text-primary",
    destructive: "bg-destructive/15 text-destructive",
  };
  return (
    <div className="rounded-2xl bg-card border border-border p-5 flex items-center gap-4">
      <span className={`size-12 rounded-xl grid place-items-center ${map[tone]}`}>
        <Icon className="size-5" />
      </span>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}
