import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCircle, canEditCareData } from "@/hooks/use-circle";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — CareCircle" }] }),
  component: TasksPage,
});

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high";
type Task = {
  id: string;
  circle_id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  assignee_id: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_by: string;
};

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "Todo" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

function TasksPage() {
  const { circle, myRole, members } = useCircle();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState<string>("");

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", circle?.id],
    enabled: !!circle,
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").eq("circle_id", circle!.id).order("created_at", { ascending: false });
      return (data ?? []) as Task[];
    },
  });

  useRealtime(
    `tasks:${circle?.id ?? "none"}`,
    circle ? [{ table: "tasks", filter: `circle_id=eq.${circle.id}` }] : [],
    () => qc.invalidateQueries({ queryKey: ["tasks", circle?.id] }),
  );

  const canCreate = canEditCareData(myRole);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!circle || !user || !title.trim()) return;
    await supabase.from("tasks").insert({
      circle_id: circle.id,
      title: title.trim(),
      priority,
      status: "todo",
      assignee_id: assignee || null,
      created_by: user.id,
    });
    setTitle(""); setAssignee(""); setPriority("medium"); setShowForm(false);
  }

  async function updateStatus(id: string, status: TaskStatus) {
    await supabase.from("tasks").update({ status, completed_at: status === "done" ? new Date().toISOString() : null }).eq("id", id);
  }
  async function removeTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
  }

  return (
    <AppShell>
      <PageHeader
        title="Tasks"
        subtitle="Shared to-dos across your circle."
        action={
          canCreate && (
            <button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90">
              <Plus className="size-4" /> New task
            </button>
          )
        }
      />

      {showForm && canCreate && (
        <form onSubmit={createTask} className="mb-6 rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title…" required className="flex-1 h-11 rounded-xl border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
          <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="h-11 rounded-xl border border-input bg-background px-3">
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="h-11 rounded-xl border border-input bg-background px-3">
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m.user_id} value={m.user_id}>{m.profile?.full_name ?? "Member"}</option>)}
          </select>
          <button type="submit" className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold">Add</button>
        </form>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="rounded-2xl bg-secondary/40 border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold">{col.label}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-border">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((t) => {
                  const assigneeName = members.find((m) => m.user_id === t.assignee_id)?.profile?.full_name ?? "Unassigned";
                  return (
                    <article key={t.id} className="rounded-xl bg-card border border-border p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium leading-tight">{t.title}</h4>
                        <PriorityChip priority={t.priority} />
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">Assigned to {assigneeName}</div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <select
                          value={t.status}
                          onChange={(e) => updateStatus(t.id, e.target.value as TaskStatus)}
                          className="text-xs h-8 rounded-lg border border-input bg-background px-2"
                        >
                          <option value="todo">Todo</option>
                          <option value="in_progress">In progress</option>
                          <option value="done">Done</option>
                        </select>
                        {canCreate && (
                          <button onClick={() => removeTask(t.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
                {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No tasks</p>}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

function PriorityChip({ priority }: { priority: TaskPriority }) {
  const map = {
    high: "bg-destructive/15 text-destructive border-destructive/30",
    medium: "bg-warning/20 text-warning-foreground border-warning/30",
    low: "bg-muted text-muted-foreground border-border",
  };
  return <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${map[priority]}`}>{priority}</span>;
}
