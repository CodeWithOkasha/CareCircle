import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Pill, Plus, CheckCircle2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCircle, canEditCareData } from "@/hooks/use-circle";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";

export const Route = createFileRoute("/medications")({
  head: () => ({ meta: [{ title: "Medications — CareCircle" }] }),
  component: MedsPage,
});

type Medication = {
  id: string; circle_id: string; name: string; dosage: string | null;
  frequency: string | null; instructions: string | null; refill_at: string | null;
};
type Log = { id: string; medication_id: string; taken_at: string };

function MedsPage() {
  const { circle, myRole } = useCircle();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const canEdit = canEditCareData(myRole);

  const { data: meds = [] } = useQuery({
    queryKey: ["medications", circle?.id],
    enabled: !!circle,
    queryFn: async () => {
      const { data } = await supabase.from("medications").select("*").eq("circle_id", circle!.id).order("name");
      return (data ?? []) as Medication[];
    },
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["medication_logs", circle?.id],
    enabled: !!circle,
    queryFn: async () => {
      const since = new Date(); since.setHours(0, 0, 0, 0);
      const { data } = await supabase.from("medication_logs").select("*").eq("circle_id", circle!.id).gte("taken_at", since.toISOString());
      return (data ?? []) as Log[];
    },
  });

  useRealtime(
    `meds:${circle?.id ?? "none"}`,
    circle ? [
      { table: "medications", filter: `circle_id=eq.${circle.id}` },
      { table: "medication_logs", filter: `circle_id=eq.${circle.id}` },
    ] : [],
    () => {
      qc.invalidateQueries({ queryKey: ["medications", circle?.id] });
      qc.invalidateQueries({ queryKey: ["medication_logs", circle?.id] });
    },
  );

  async function addMed(e: React.FormEvent) {
    e.preventDefault();
    if (!circle || !user || !name.trim()) return;
    await supabase.from("medications").insert({
      circle_id: circle.id, name: name.trim(), dosage: dosage || null,
      frequency: frequency || null, created_by: user.id,
    });
    setName(""); setDosage(""); setFrequency(""); setShowForm(false);
  }
  async function logDose(medId: string) {
    if (!circle || !user) return;
    await supabase.from("medication_logs").insert({ medication_id: medId, circle_id: circle.id, logged_by: user.id });
  }
  async function removeMed(id: string) { await supabase.from("medications").delete().eq("id", id); }

  return (
    <AppShell>
      <PageHeader
        title="Medications"
        subtitle="Doses, schedules, and refills — all in one place."
        action={canEdit && (
          <button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90">
            <Plus className="size-4" /> Add medication
          </button>
        )}
      />

      {showForm && canEdit && (
        <form onSubmit={addMed} className="mb-6 grid sm:grid-cols-4 gap-3 rounded-2xl border border-border bg-card p-4">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Lisinopril)" className="h-11 rounded-xl border border-input bg-background px-3 sm:col-span-2" />
          <input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="Dosage (10mg)" className="h-11 rounded-xl border border-input bg-background px-3" />
          <input value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="Frequency" className="h-11 rounded-xl border border-input bg-background px-3" />
          <button type="submit" className="sm:col-span-4 h-11 rounded-xl bg-primary text-primary-foreground font-semibold">Save medication</button>
        </form>
      )}

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <ul className="divide-y divide-border">
          {meds.map((m) => {
            const takenToday = logs.some((l) => l.medication_id === m.id);
            return (
              <li key={m.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 items-center">
                <div className="md:col-span-5 flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
                    <Pill className="size-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-sm text-muted-foreground">{m.dosage ?? "—"}</div>
                  </div>
                </div>
                <div className="md:col-span-4 text-sm">{m.frequency ?? "—"}</div>
                <div className="md:col-span-3 md:text-right flex md:justify-end items-center gap-2">
                  {takenToday ? (
                    <span className="inline-flex items-center gap-1.5 text-success font-medium text-sm">
                      <CheckCircle2 className="size-4" /> Taken today
                    </span>
                  ) : (
                    <button onClick={() => logDose(m.id)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
                      Mark taken
                    </button>
                  )}
                  {canEdit && (
                    <button onClick={() => removeMed(m.id)} className="text-muted-foreground hover:text-destructive p-1.5" aria-label="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
          {meds.length === 0 && <li className="px-6 py-10 text-center text-sm text-muted-foreground">No medications yet.</li>}
        </ul>
      </div>
    </AppShell>
  );
}
