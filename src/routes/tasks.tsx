import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, RoleBadge, type Role } from "@/components/app-shell";
import { Plus, Filter, Search } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — CareCircle" }] }),
  component: TasksPage,
});

type Task = {
  id: string;
  title: string;
  due: string;
  assignee: string;
  role: Role;
  priority: "Low" | "Medium" | "High";
  status: "Todo" | "In progress" | "Done";
};

const TASKS: Task[] = [
  { id: "1", title: "Refill blood pressure prescription", due: "Today, 5:00 PM", assignee: "Daniel Park", role: "Admin", priority: "High", status: "In progress" },
  { id: "2", title: "Drive to physiotherapy appointment", due: "Tomorrow, 10:00 AM", assignee: "Sarah Miller", role: "Coordinator", priority: "Medium", status: "Todo" },
  { id: "3", title: "Grocery run — soft foods", due: "Wed, Jun 10", assignee: "Emma Lopez", role: "Helper", priority: "Low", status: "Todo" },
  { id: "4", title: "Change bedsheets", due: "Today", assignee: "James Chen", role: "Helper", priority: "Medium", status: "Done" },
  { id: "5", title: "Schedule eye exam", due: "Next week", assignee: "Sarah Miller", role: "Coordinator", priority: "Low", status: "Todo" },
];

const COLUMNS: Task["status"][] = ["Todo", "In progress", "Done"];

function TasksPage() {
  return (
    <AppShell>
      <PageHeader
        title="Tasks"
        subtitle="Shared to-dos across your circle. Drag, assign, complete."
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90">
            <Plus className="size-4" /> New task
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search tasks…"
            className="w-full h-11 rounded-xl border border-input bg-card pl-10 pr-3 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-input bg-card hover:bg-muted">
          <Filter className="size-4" /> Filters
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const items = TASKS.filter((t) => t.status === col);
          return (
            <div key={col} className="rounded-2xl bg-secondary/40 border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold">{col}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-border">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((t) => (
                  <article key={t.id} className="rounded-xl bg-card border border-border p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium leading-tight">{t.title}</h4>
                      <PriorityChip priority={t.priority} />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">{t.due}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="size-6 rounded-full bg-secondary grid place-items-center text-[10px] font-semibold">
                          {t.assignee.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="truncate max-w-[100px]">{t.assignee}</span>
                      </div>
                      <RoleBadge role={t.role} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

function PriorityChip({ priority }: { priority: Task["priority"] }) {
  const map = {
    High: "bg-destructive/15 text-destructive border-destructive/30",
    Medium: "bg-warning/20 text-warning-foreground border-warning/30",
    Low: "bg-muted text-muted-foreground border-border",
  };
  return <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${map[priority]}`}>{priority}</span>;
}
