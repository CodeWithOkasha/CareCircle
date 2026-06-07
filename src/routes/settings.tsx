import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader, RoleBadge, appRoleToLabel } from "@/components/app-shell";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCircle } from "@/hooks/use-circle";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Profile & Settings — CareCircle" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, user, signOut, updateProfile } = useAuth();
  const { circle, myRole } = useCircle();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setFullName(profile?.full_name ?? ""); }, [profile?.full_name]);

  const displayName = profile?.full_name || user?.email || "You";
  const initials = displayName.split(/[\s@]/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const role = myRole ?? profile?.role ?? "helper";

  async function handleSignOut() { await signOut(); navigate({ to: "/login" }); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await updateProfile({ full_name: fullName });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AppShell>
      <PageHeader title="Profile & settings" subtitle="Manage your account and circle." />

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1 rounded-2xl bg-card border border-border p-6 text-center">
          <div className="size-24 rounded-full bg-gradient-to-br from-primary to-info text-primary-foreground grid place-items-center font-bold text-3xl mx-auto">
            {initials || "?"}
          </div>
          <h2 className="mt-4 text-xl font-bold">{displayName}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-3 flex justify-center"><RoleBadge role={appRoleToLabel(role)} /></div>
          <dl className="mt-6 text-left text-sm divide-y divide-border border-t border-b border-border">
            <Row label="Care circle" value={circle?.name ?? "—"} />
            <Row label="Member since" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"} />
          </dl>
          <button onClick={handleSignOut} className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold">
            <LogOut className="size-4" /> Sign out
          </button>
        </section>

        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={save} className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <h3 className="font-display text-lg font-bold">Account information</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full h-11 rounded-xl border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input value={user?.email ?? ""} disabled className="w-full h-11 rounded-xl border border-input bg-muted px-3 text-muted-foreground" />
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-60">
                {saving ? "Saving…" : "Save changes"}
              </button>
              {saved && <span className="text-sm text-success">Saved.</span>}
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
