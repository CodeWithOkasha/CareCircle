import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, RoleBadge } from "@/components/app-shell";
import { Bell, Lock, Languages, Moon, LogOut, Camera } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Profile & Settings — CareCircle" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Profile & settings" subtitle="Manage your account, notifications, and preferences." />

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1 rounded-2xl bg-card border border-border p-6 text-center">
          <div className="relative inline-block">
            <div className="size-24 rounded-full bg-gradient-to-br from-primary to-info text-primary-foreground grid place-items-center font-bold text-3xl mx-auto">
              SM
            </div>
            <button className="absolute bottom-0 right-0 size-9 rounded-full bg-card border border-border grid place-items-center hover:bg-muted" aria-label="Change photo">
              <Camera className="size-4" />
            </button>
          </div>
          <h2 className="mt-4 text-xl font-bold">Sarah Miller</h2>
          <p className="text-sm text-muted-foreground">sarah@example.com</p>
          <div className="mt-3 flex justify-center"><RoleBadge role="Coordinator" /></div>
          <dl className="mt-6 text-left text-sm divide-y divide-border border-t border-b border-border">
            <Row label="Member since" value="January 2025" />
            <Row label="Care circle" value="Margaret's circle" />
            <Row label="Time zone" value="America/New_York" />
          </dl>
          <button className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold">
            <LogOut className="size-4" /> Sign out
          </button>
        </section>

        <div className="lg:col-span-2 space-y-6">
          <Panel title="Account information">
            <Field label="Full name" defaultValue="Sarah Miller" />
            <Field label="Email" type="email" defaultValue="sarah@example.com" />
            <Field label="Phone" defaultValue="+1 (555) 234-5678" />
            <div className="pt-2">
              <button className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90">Save changes</button>
            </div>
          </Panel>

          <Panel title="Notifications" icon={Bell}>
            <Toggle label="Patient alerts (HELP, pain, water)" defaultChecked desc="Always recommended — alerts are critical." />
            <Toggle label="Medication reminders" defaultChecked />
            <Toggle label="Task assignments" defaultChecked />
            <Toggle label="Weekly digest email" />
          </Panel>

          <Panel title="Preferences" icon={Languages}>
            <Select label="Language" options={["English (US)", "Español", "Français", "Deutsch"]} />
            <Select label="Date format" options={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]} />
            <Toggle label="Dark mode" icon={Moon} desc="Easier on the eyes at night." />
            <Toggle label="Large text in Patient Mode" defaultChecked desc="Recommended for elderly users." />
          </Panel>

          <Panel title="Security" icon={Lock}>
            <Field label="Current password" type="password" placeholder="••••••••" />
            <Field label="New password" type="password" placeholder="At least 8 characters" />
            <Toggle label="Two-factor authentication" desc="Add a second step to keep your circle safe." />
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon?: typeof Bell; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card border border-border p-6">
      <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-5">
        {Icon && <Icon className="size-5 text-primary" />}
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full h-11 rounded-xl border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <select className="w-full h-11 rounded-xl border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Toggle({
  label,
  desc,
  defaultChecked,
  icon: Icon,
}: { label: string; desc?: string; defaultChecked?: boolean; icon?: typeof Bell }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <span className="flex-1">
        <span className="flex items-center gap-2 font-medium">
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          {label}
        </span>
        {desc && <span className="block text-xs text-muted-foreground mt-0.5">{desc}</span>}
      </span>
      <span className="relative inline-block">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="block w-11 h-6 rounded-full bg-muted peer-checked:bg-primary transition-colors" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-card shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
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
