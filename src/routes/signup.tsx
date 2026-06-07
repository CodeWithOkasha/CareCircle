import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeartPulse, User, Mail, Lock, Users } from "lucide-react";
import { useAuth, type AppRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — CareCircle" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("coordinator");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error, needsConfirmation } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) setError(error);
    else if (needsConfirmation) setInfo("Check your email to confirm your account, then log in.");
    else navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-background">
      <main className="flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="size-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center">
              <HeartPulse className="size-5" />
            </div>
            <span className="font-display font-bold text-xl">CareCircle</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Create your circle</h1>
          <p className="mt-2 text-muted-foreground">It takes less than a minute.</p>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <Field label="Full name" icon={<User className="size-4" />} required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Sarah Miller" />
            <Field label="Email" icon={<Mail className="size-4" />} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <Field label="Password" icon={<Lock className="size-4" />} type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />

            <div>
              <label className="block text-sm font-medium mb-1.5">Your role</label>
              <div className="grid grid-cols-3 gap-2">
                {(["admin", "coordinator", "helper"] as const).map((r) => (
                  <label
                    key={r}
                    className={`cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-medium hover:bg-muted ${role === r ? "border-primary bg-primary-soft text-primary" : "border-input bg-card"}`}
                  >
                    <input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive px-3 py-2 text-sm">{error}</div>}
            {info && <div className="rounded-xl border border-success/30 bg-success/10 text-success px-3 py-2 text-sm">{info}</div>}

            <button
              type="submit"
              disabled={loading}
              className="block text-center w-full px-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </main>

      <aside className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-accent to-primary-soft order-1 lg:order-2">
        <div />
        <div>
          <Users className="size-10 text-primary" />
          <h2 className="mt-4 text-4xl font-bold tracking-tight">Better care, together.</h2>
          <p className="mt-4 text-foreground/75 max-w-md text-lg">
            Invite family, friends, and caregivers. Assign roles. Share the small wins.
          </p>
        </div>
        <p className="text-sm text-foreground/60">© CareCircle Health</p>
      </aside>
    </div>
  );
}

function Field({ label, icon, ...props }: { label: string; icon?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input {...props} className="w-full h-12 rounded-xl border border-input bg-card pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
      </div>
    </div>
  );
}
