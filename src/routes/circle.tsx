import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, RoleBadge, appRoleToLabel } from "@/components/app-shell";
import { Users, Trash2 } from "lucide-react";
import { useCircle, isAdmin } from "@/hooks/use-circle";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/circle")({
  head: () => ({ meta: [{ title: "Circle — CareCircle" }] }),
  component: CirclePage,
});

function CirclePage() {
  const { circle, members, myRole, reload } = useCircle();
  const { user } = useAuth();
  const admin = isAdmin(myRole);

  const counts = {
    admin: members.filter((m) => m.role === "admin").length,
    coordinator: members.filter((m) => m.role === "coordinator").length,
    helper: members.filter((m) => m.role === "helper").length,
  };

  async function changeRole(id: string, role: AppRole) {
    await supabase.from("circle_members").update({ role }).eq("id", id);
    reload();
  }
  async function removeMember(id: string) {
    await supabase.from("circle_members").delete().eq("id", id);
    reload();
  }

  return (
    <AppShell>
      <PageHeader
        title="Circle management"
        subtitle={circle ? `${circle.name} — ${members.length} members` : "Loading…"}
        action={
          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-muted-foreground font-medium">
            <Users className="size-4" /> Invites coming soon
          </span>
        }
      />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <RoleCard role="Admin" count={counts.admin} desc="Full access. Manages the circle." />
        <RoleCard role="Coordinator" count={counts.coordinator} desc="Plans care, assigns tasks, manages calendar." />
        <RoleCard role="Helper" count={counts.helper} desc="Completes tasks and supports the patient." />
      </div>

      <section className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-lg">Members</h2>
        </div>
        <ul className="divide-y divide-border">
          {members.map((m) => {
            const name = m.profile?.full_name ?? "Member";
            const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <li key={m.id} className="px-6 py-4 flex items-center gap-4">
                <div className="size-12 rounded-full bg-gradient-to-br from-primary to-info text-primary-foreground grid place-items-center font-semibold">
                  {initials || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">{name}{m.user_id === user?.id && " (You)"}</span>
                    <RoleBadge role={appRoleToLabel(m.role)} />
                  </div>
                </div>
                {admin && m.user_id !== user?.id && (
                  <>
                    <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value as AppRole)} className="h-9 rounded-lg border border-input bg-background px-2 text-sm">
                      <option value="admin">Admin</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="helper">Helper</option>
                    </select>
                    <button onClick={() => removeMember(m.id)} className="text-muted-foreground hover:text-destructive p-2" aria-label="Remove">
                      <Trash2 className="size-4" />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}

function RoleCard({ role, count, desc }: { role: "Admin" | "Coordinator" | "Helper"; count: number; desc: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center justify-between">
        <RoleBadge role={role} />
        <span className="text-2xl font-bold tabular-nums">{count}</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
