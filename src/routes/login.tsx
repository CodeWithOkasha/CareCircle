import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — CareCircle" }] }),
  component: LoginPage,
});

function LoginPage() {
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

          <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
            <Field label="Email" icon={<Mail className="size-4" />} type="email" placeholder="you@example.com" />
            <Field label="Password" icon={<Lock className="size-4" />} type="password" placeholder="••••••••" />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="size-4 rounded border-input accent-primary" />
                Remember me
              </label>
              <a href="#" className="text-primary font-medium hover:underline">Forgot password?</a>
            </div>

            <Link
              to="/dashboard"
              className="block text-center w-full px-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90"
            >
              Log in
            </Link>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px bg-border flex-1" /> OR <div className="h-px bg-border flex-1" />
          </div>

          <button className="w-full px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted font-medium">
            Continue with Google
          </button>

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
