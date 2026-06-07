import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CheckSquare,
  Pill,
  CalendarDays,
  Activity,
  HeartPulse,
  Users,
  FileBarChart,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { useCircle } from "@/hooks/use-circle";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  highlight?: boolean;
};

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/medications", label: "Medications", icon: Pill },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/patient", label: "Patient Mode", icon: HeartPulse, highlight: true },
  { to: "/circle", label: "Circle", icon: Users },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-dvh grid place-items-center bg-background text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Loading your circle…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-sidebar-border bg-sidebar">
        <Brand />
        <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
        <UserCard />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 backdrop-blur px-4 h-16">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Logo />
          <span className="font-display font-bold text-lg">CareCircle</span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-muted relative" aria-label="Notifications">
            <Bell className="size-5" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-muted"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-6" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="relative ml-auto w-72 bg-sidebar h-full flex flex-col animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4">
              <Brand inline />
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 rounded-full hover:bg-muted">
                <X className="size-5" />
              </button>
            </div>
            <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
            <UserCard />
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-6 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

function Brand({ inline = false }: { inline?: boolean }) {
  const { circle } = useCircle();
  return (
    <div className={cn("flex items-center gap-3", inline ? "" : "px-6 h-20 border-b border-sidebar-border")}>
      <Logo />
      <div className="min-w-0">
        <div className="font-display font-bold text-xl leading-none">CareCircle</div>
        <div className="text-xs text-muted-foreground mt-1 truncate">{circle?.name ?? "Care, together."}</div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="size-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-sm">
      <HeartPulse className="size-5" />
    </div>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent",
              item.highlight && !active && "ring-1 ring-accent/50 bg-accent/30 text-accent-foreground",
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserCard() {
  const { profile, user, signOut } = useAuth();
  const { myRole } = useCircle();
  const navigate = useNavigate();
  const displayName = profile?.full_name || user?.email || "You";
  const initials = displayName
    .split(/[\s@]/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const role: AppRole = myRole ?? profile?.role ?? "helper";

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="p-3 border-t border-sidebar-border flex items-center gap-2">
      <Link
        to="/settings"
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors flex-1 min-w-0"
      >
        <div className="size-10 rounded-full bg-gradient-to-br from-primary to-info text-primary-foreground grid place-items-center font-semibold">
          {initials || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{displayName}</div>
          <RoleBadge role={appRoleToLabel(role)} />
        </div>
      </Link>
      <button
        onClick={handleSignOut}
        aria-label="Sign out"
        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

export type Role = "Admin" | "Coordinator" | "Helper";

export function appRoleToLabel(r: AppRole): Role {
  return (r.charAt(0).toUpperCase() + r.slice(1)) as Role;
}

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  const styles: Record<Role, string> = {
    Admin: "bg-primary/15 text-primary border-primary/30",
    Coordinator: "bg-info/15 text-info border-info/30",
    Helper: "bg-success/15 text-success border-success/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
        styles[role],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {role}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2 text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
