import { useState } from 'react';
import { Mail, MapPin, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    window.setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <BackdropGlow />

      <main className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-28 sm:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5">
            <Mail className="h-3.5 w-3.5 text-cyan-300" />
            <span className="text-[11px] font-medium tracking-widest text-white/60">GET IN TOUCH</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
          <p className="mx-auto mt-3 max-w-lg text-white/50">
            Questions, partnerships, or just want to say hello? We read every message.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.5fr]">
          {/* Info column */}
          <div className="flex flex-col gap-4">
            <InfoCard icon={Mail} title="Email" value="hello@arcadeai.games" accent="#06b6d4" />
            <InfoCard icon={MessageSquare} title="Discord" value="Join the community" accent="#22c55e" />
            <InfoCard icon={MapPin} title="Location" value="Remote · Worldwide" accent="#f59e0b" />
          </div>

          {/* Form column */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="mb-4 h-14 w-14 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">Message sent!</h3>
                <p className="mt-2 text-sm text-white/50">We\u2019ll get back to you within 48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Name">
                    <input
                      required
                      type="text"
                      placeholder="Your name"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                    />
                  </Field>
                </div>
                <Field label="Subject">
                  <input
                    required
                    type="text"
                    placeholder="What\u2019s this about?"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                  />
                </Field>
                <Field label="Message">
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us more..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                  />
                </Field>
                <button
                  type="submit"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/30"
                >
                  Send Message
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold tracking-wide text-white/50">{label}</span>
      {children}
    </label>
  );
}

function InfoCard({ icon: Icon, title, value, accent }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; title: string; value: string; accent: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition hover:border-white/20">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1"
        style={{ background: `${accent}15`, borderColor: `${accent}40` }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-wide text-white/40">{title}</p>
        <p className="text-sm font-medium text-white/85">{value}</p>
      </div>
    </div>
  );
}

function BackdropGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[140px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-emerald-500/6 blur-[120px]" />
    </div>
  );
}
