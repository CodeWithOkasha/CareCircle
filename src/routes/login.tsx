import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeartPulse, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — CareCircle" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-background">
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary to-info text-primary-foreground">
        <Link to="/" className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-white/15 backdrop-blur grid place-items-center">
            <HeartPulse className="size-5" />
          </div>
          <span className="font-display font-bold text-xl">CareCircle</span>
        </Link>
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Welcome back.</h2>
          <p className="mt-4 text-primary-foreground/85 max-w-md text-lg">
            Pick up right where your circle left off — today's medications, tasks, and check-ins
            are waiting for you.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">© CareCircle Health</p>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="size-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center">
              <HeartPulse className="size-5" />
            </div>
            <span className="font-display font-bold text-xl">CareCircle</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Log in</h1>
          <p className="mt-2 text-muted-foreground">Glad you're back. Care continues here.</p>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <Field
              label="Email"
              icon={<Mail className="size-4" />}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              icon={<Lock className="size-4" />}
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="block text-center w-full px-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  icon,
  ...props
}: { label: string; icon?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          {...props}
          className="w-full h-12 rounded-xl border border-input bg-card pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>
    </div>
  );
}
