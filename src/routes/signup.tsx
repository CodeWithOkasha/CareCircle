import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, User, Mail, Lock, Users } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — CareCircle" }] }),
  component: SignupPage,
});

function SignupPage() {
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

          <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
            <Field label="Full name" icon={<User className="size-4" />} placeholder="Sarah Miller" />
            <Field label="Email" icon={<Mail className="size-4" />} type="email" placeholder="you@example.com" />
            <Field label="Password" icon={<Lock className="size-4" />} type="password" placeholder="At least 8 characters" />

            <div>
              <label className="block text-sm font-medium mb-1.5">Your role</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Admin", "Coordinator", "Helper"] as const).map((r, i) => (
                  <label
                    key={r}
                    className="cursor-pointer rounded-xl border border-input bg-card px-3 py-3 text-center text-sm font-medium hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary"
                  >
                    <input type="radio" name="role" defaultChecked={i === 1} className="sr-only" />
                    {r}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="mt-1 size-4 rounded border-input accent-primary" />
              <span>I agree to the Terms of Service and Privacy Policy.</span>
            </label>

            <Link
              to="/dashboard"
              className="block text-center w-full px-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90"
            >
              Create account
            </Link>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>

      <aside className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-accent to-primary-soft order-1 lg:order-2">
        <div />
        <div>
          <Users className="size-10 text-primary" />
          <h2 className="mt-4 text-4xl font-bold tracking-tight">Better care, together.</h2>
          <p className="mt-4 text-foreground/75 max-w-md text-lg">
            Invite family, friends, and caregivers. Assign roles. Share the small wins. CareCircle
            keeps everyone gently in sync.
          </p>
        </div>
        <p className="text-sm text-foreground/60">© CareCircle Health</p>
      </aside>
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
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          {...props}
          className="w-full h-12 rounded-xl border border-input bg-card pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>
    </div>
  );
}
