import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCircle, canEditCareData } from "@/hooks/use-circle";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Shared Calendar — CareCircle" }] }),
  component: CalendarPage,
});

type Appointment = { id: string; title: string; location: string | null; starts_at: string; ends_at: string | null };

function CalendarPage() {
  const { circle, myRole } = useCircle();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [cursor, setCursor] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [location, setLocation] = useState("");
  const canEdit = canEditCareData(myRole);

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const firstWeekday = monthStart.getDay();

  const { data: events = [] } = useQuery({
    queryKey: ["appointments", circle?.id, cursor.getFullYear(), cursor.getMonth()],
    enabled: !!circle,
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments").select("*").eq("circle_id", circle!.id)
        .gte("starts_at", monthStart.toISOString())
        .lte("starts_at", new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59).toISOString())
        .order("starts_at");
      return (data ?? []) as Appointment[];
    },
  });

  useRealtime(
    `appts:${circle?.id ?? "none"}`,
    circle ? [{ table: "appointments", filter: `circle_id=eq.${circle.id}` }] : [],
    () => qc.invalidateQueries({ queryKey: ["appointments", circle?.id] }),
  );

  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  async function addAppt(e: React.FormEvent) {
    e.preventDefault();
    if (!circle || !user || !title || !startsAt) return;
    await supabase.from("appointments").insert({
      circle_id: circle.id, title, location: location || null,
      starts_at: new Date(startsAt).toISOString(), created_by: user.id,
    });
    setTitle(""); setStartsAt(""); setLocation(""); setShowForm(false);
  }
  async function removeAppt(id: string) { await supabase.from("appointments").delete().eq("id", id); }

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === cursor.getFullYear() && today.getMonth() === cursor.getMonth();

  return (
    <AppShell>
      <PageHeader
        title="Shared Calendar"
        subtitle="Appointments, visits, and care events."
        action={canEdit && (
          <button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90">
            <Plus className="size-4" /> New event
          </button>
        )}
      />

      {showForm && canEdit && (
        <form onSubmit={addAppt} className="mb-6 grid sm:grid-cols-4 gap-3 rounded-2xl border border-border bg-card p-4">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-11 rounded-xl border border-input bg-background px-3 sm:col-span-2" />
          <input required type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="h-11 rounded-xl border border-input bg-background px-3" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="h-11 rounded-xl border border-input bg-background px-3" />
          <button type="submit" className="sm:col-span-4 h-11 rounded-xl bg-primary text-primary-foreground font-semibold">Save event</button>
        </form>
      )}

      <div className="rounded-2xl bg-card border border-border p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-bold">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="size-10 rounded-xl hover:bg-muted grid place-items-center"><ChevronLeft className="size-5" /></button>
            <button onClick={() => setCursor(new Date())} className="px-3 h-10 rounded-xl border border-input hover:bg-muted text-sm font-medium">Today</button>
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="size-10 rounded-xl hover:bg-muted grid place-items-center"><ChevronRight className="size-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="bg-muted/60 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>
          ))}
          {cells.map((day, idx) => {
            const dayEvents = day ? events.filter((e) => new Date(e.starts_at).getDate() === day) : [];
            const isToday = isCurrentMonth && day === today.getDate();
            return (
              <div key={idx} className="bg-card min-h-24 sm:min-h-32 p-2 flex flex-col gap-1">
                {day && (
                  <span className={`text-sm font-semibold size-7 grid place-items-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>{day}</span>
                )}
                <div className="flex flex-col gap-1 mt-1">
                  {dayEvents.map((e) => (
                    <span key={e.id} className="group text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md border truncate bg-primary/15 text-primary border-primary/30 flex items-center justify-between gap-1">
                      <span className="truncate">{new Date(e.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {e.title}</span>
                      {canEdit && <button onClick={() => removeAppt(e.id)} className="opacity-0 group-hover:opacity-100"><Trash2 className="size-3" /></button>}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
