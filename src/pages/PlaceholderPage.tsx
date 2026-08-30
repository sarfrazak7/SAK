import { Construction, ArrowLeft } from 'lucide-react';
import type { Route } from '@/lib/router';
import { linkHref } from '@/lib/router';

interface Props {
  title: string;
  subtitle: string;
  img: string;
  accent: string;
  onNavigate: (r: Route) => void;
}

export default function PlaceholderPage({ title, subtitle, img, accent, onNavigate }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[140px]"
          style={{ background: `${accent}10` }}
        />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 text-center">
        <div className="relative mb-8 h-56 w-full max-w-md overflow-hidden rounded-2xl border border-white/10">
          <img src={img} alt={title} className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ring-1"
          style={{ background: `${accent}15`, borderColor: `${accent}40` }}
        >
          <Construction className="h-8 w-8" style={{ color: accent }} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-md text-white/50">{subtitle}</p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/40">
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: accent }} />
          In development
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="mt-10 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Arcade
        </button>
      </main>
    </div>
  );
}
