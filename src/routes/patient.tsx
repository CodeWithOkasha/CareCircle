import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { HeartPulse, Droplet, HandHelping, AlertOctagon, Smile, Meh, Frown, Laugh, Annoyed, Send, ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/patient")({
  head: () => ({ meta: [{ title: "Patient Mode — CareCircle" }] }),
  component: PatientMode,
});

function PatientMode() {
  const [pain, setPain] = useState(3);
  const [mood, setMood] = useState<string | null>("Good");
  const [sent, setSent] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function send(label: string) {
    setSent(label);
    setTimeout(() => setSent(null), 2500);
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary-soft via-background to-background">
      <header className="px-5 sm:px-8 py-5 flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-lg font-medium hover:underline">
          <ArrowLeft className="size-6" /> Back
        </Link>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Signed in as</div>
          <div className="text-lg font-bold">Margaret (Mom)</div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 sm:px-8 pb-16">
        <div className="text-center mt-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">How are you, Margaret?</h1>
          <p className="mt-3 text-lg sm:text-xl text-muted-foreground">
            Tap a big button. Your circle will know right away.
          </p>
        </div>

        {/* HELP — emergency */}
        <button
          onClick={() => send("Your circle has been alerted — help is on the way.")}
          className="mt-10 w-full rounded-3xl bg-destructive text-destructive-foreground p-8 sm:p-10 shadow-xl shadow-destructive/20 hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-5"
        >
          <AlertOctagon className="size-12 sm:size-14" />
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">HELP</span>
        </button>

        {/* Quick signals */}
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <BigButton icon={HandHelping} label="I Need Help" tone="primary" onClick={() => send("We told your circle you need help.")} />
          <BigButton icon={HeartPulse} label="I Am In Pain" tone="warning" onClick={() => send("Your pain message was sent.")} />
          <BigButton icon={Droplet} label="I Need Water" tone="info" onClick={() => send("Someone will bring you water.")} />
        </div>

        {/* Mood */}
        <section className="mt-10 rounded-3xl bg-card border border-border p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold">How are you feeling?</h2>
          <div className="mt-5 grid grid-cols-5 gap-3">
            {[
              { label: "Great", icon: Laugh, color: "text-success" },
              { label: "Good", icon: Smile, color: "text-success" },
              { label: "Okay", icon: Meh, color: "text-warning-foreground" },
              { label: "Low", icon: Annoyed, color: "text-accent-foreground" },
              { label: "Sad", icon: Frown, color: "text-destructive" },
            ].map((m) => {
              const active = mood === m.label;
              return (
                <button
                  key={m.label}
                  onClick={() => setMood(m.label)}
                  className={`rounded-2xl border-2 p-4 sm:p-5 flex flex-col items-center gap-2 transition ${active ? "border-primary bg-primary-soft" : "border-border bg-background hover:bg-muted"}`}
                >
                  <m.icon className={`size-9 sm:size-10 ${m.color}`} />
                  <span className="text-sm sm:text-base font-semibold">{m.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Pain scale */}
        <section className="mt-6 rounded-3xl bg-card border border-border p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold">Pain level</h2>
            <span className="text-5xl sm:text-6xl font-extrabold text-primary tabular-nums">{pain}</span>
          </div>
          <p className="text-muted-foreground mt-1">Slide from 0 (none) to 10 (worst).</p>
          <input
            type="range"
            min={0}
            max={10}
            value={pain}
            onChange={(e) => setPain(Number(e.target.value))}
            className="w-full mt-5 h-3 rounded-full appearance-none bg-gradient-to-r from-success via-warning to-destructive accent-primary"
            aria-label="Pain level"
          />
          <div className="mt-2 grid grid-cols-11 text-xs text-muted-foreground">
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i} className="text-center">{i}</span>
            ))}
          </div>
        </section>

        {/* Custom message */}
        <section className="mt-6 rounded-3xl bg-card border border-border p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Send a message</h2>
          <p className="text-muted-foreground mt-1">Tell your circle anything else.</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="I'd like a cup of tea please…"
            rows={3}
            className="w-full mt-4 rounded-2xl border-2 border-input bg-background p-4 text-lg outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <button
            onClick={() => {
              if (!message.trim()) return;
              send("Your message was sent to the circle.");
              setMessage("");
            }}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground text-lg font-bold hover:opacity-90"
          >
            <Send className="size-5" /> Send to my circle
          </button>
        </section>
      </main>

      {/* Toast */}
      {sent && (
        <div className="fixed bottom-6 inset-x-0 px-4 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="mx-auto max-w-md rounded-2xl bg-foreground text-background px-5 py-4 flex items-center gap-3 shadow-2xl">
            <span className="size-8 rounded-full bg-success grid place-items-center text-success-foreground">
              <Check className="size-4" />
            </span>
            <span className="font-semibold">{sent}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function BigButton({
  icon: Icon,
  label,
  tone,
  onClick,
}: {
  icon: typeof Droplet;
  label: string;
  tone: "primary" | "warning" | "info";
  onClick: () => void;
}) {
  const map = {
    primary: "bg-primary text-primary-foreground shadow-primary/20",
    warning: "bg-warning text-warning-foreground shadow-warning/30",
    info: "bg-info text-info-foreground shadow-info/20",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-3xl p-7 shadow-lg active:scale-[0.99] transition flex flex-col items-center gap-3 ${map[tone]}`}
    >
      <Icon className="size-10" />
      <span className="text-xl sm:text-2xl font-bold text-center leading-tight">{label}</span>
    </button>
  );
}
