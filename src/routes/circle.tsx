import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, RoleBadge, type Role } from "@/components/app-shell";
import { UserPlus, Mail, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/circle")({
  head: () => ({ meta: [{ title: "Circle — CareCircle" }] }),
  component: CirclePage,
});

type Member = {
  name: string;
  email: string;
  role: Role;
  relation: string;
  joined: string;
  initials: string;
};

const MEMBERS: Member[] = [
  { name: "Daniel Park", email: "daniel@example.com", role: "Admin", relation: "Son", joined: "Jan 2025", initials: "DP" },
  { name: "Sarah Miller", email: "sarah@example.com", role: "Coordinator", relation: "Daughter", joined: "Jan 2025", initials: "SM" },
  { name: "Emma Lopez", email: "emma@example.com", role: "Helper", relation: "Granddaughter", joined: "Mar 2025", initials: "EL" },
  { name: "James Chen", email: "james@example.com", role: "Helper", relation: "Neighbor", joined: "Apr 2025", initials: "JC" },
  { name: "Dr. Hall", email: "h.hall@clinic.com", role: "Helper", relation: "Physician", joined: "May 2025", initials: "DH" },
];

const PENDING = [
  { email: "auntmae@example.com", role: "Helper" as Role, sent: "2 days ago" },
];

function CirclePage() {
  return (
    <AppShell>
      <PageHeader
        title="Circle management"
        subtitle="Margaret's care circle — 5 members across 3 roles."
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90">
            <UserPlus className="size-4" /> Invite member
          </button>
        }
      />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <RoleCard role="Admin" count={1} desc="Full access. Manages the circle and billing." />
        <RoleCard role="Coordinator" count={1} desc="Plans care, assigns tasks, manages calendar." />
        <RoleCard role="Helper" count={3} desc="Completes tasks and supports the patient." />
      </div>

      <section className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Members</h2>
          <span className="text-sm text-muted-foreground">{MEMBERS.length} active</span>
        </div>
        <ul className="divide-y divide-border">
          {MEMBERS.map((m) => (
            <li key={m.email} className="px-6 py-4 flex items-center gap-4">
              <div className="size-12 rounded-full bg-gradient-to-br from-primary to-info text-primary-foreground grid place-items-center font-semibold">
                {m.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold truncate">{m.name}</span>
                  <RoleBadge role={m.role} />
                </div>
                <div className="text-sm text-muted-foreground truncate">{m.relation} · {m.email}</div>
              </div>
              <div className="hidden sm:block text-sm text-muted-foreground">Joined {m.joined}</div>
              <button className="size-9 rounded-lg hover:bg-muted grid place-items-center" aria-label="More">
                <MoreHorizontal className="size-5" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-lg">Pending invitations</h2>
        </div>
        <ul className="divide-y divide-border">
          {PENDING.map((p) => (
            <li key={p.email} className="px-6 py-4 flex items-center gap-4">
              <div className="size-12 rounded-full bg-muted grid place-items-center text-muted-foreground">
                <Mail className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{p.email}</div>
                <div className="text-sm text-muted-foreground">Invited as {p.role} · {p.sent}</div>
              </div>
              <button className="px-3 py-1.5 rounded-lg border border-input hover:bg-muted text-sm font-medium">Resend</button>
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10">Cancel</button>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

function RoleCard({ role, count, desc }: { role: Role; count: number; desc: string }) {
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
