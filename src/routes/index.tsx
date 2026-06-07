import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { HeartPulse, Users, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareCircle — Coordinate care, together" },
      { name: "description", content: "A calm, shared space for families and caregivers to manage medications, tasks, and well-being." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && user) navigate({ to: "/dashboard" }); }, [user, loading, navigate]);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary-soft via-background to-accent/40">
      <header className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center">
            <HeartPulse className="size-5" />
          </div>
          <span className="font-display font-bold text-xl">CareCircle</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="px-4 py-2 rounded-full text-sm font-medium hover:bg-card transition-colors">Log in</Link>
          <Link to="/signup" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90">Get started</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-12 pb-24 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-medium text-muted-foreground">
          <span className="size-2 rounded-full bg-success" /> For families & caregivers
        </span>
        <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
          Care that brings the <span className="text-primary">whole circle</span> together.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Coordinate medications, daily tasks, and well-being checks for the people you love — all in one calm, shared space.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/signup" className="px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:opacity-90">Get started free</Link>
          <Link to="/login" className="px-6 py-3.5 rounded-full bg-card border border-border font-semibold hover:bg-muted">Log in</Link>
        </div>

        <div className="mt-20 grid sm:grid-cols-3 gap-4 text-left">
          {[
            { icon: Users, title: "Your circle", desc: "Invite family, friends, and professional caregivers with clear roles." },
            { icon: HeartPulse, title: "Patient-first", desc: "An elderly-friendly mode with one-tap help, mood, and pain check-ins." },
            { icon: ShieldCheck, title: "Calm by design", desc: "Large type, gentle colors, accessible from any device." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-card border border-border p-6">
              <f.icon className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
