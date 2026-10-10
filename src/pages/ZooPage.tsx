import { useState } from 'react';
import { Boxes, ChevronDown } from 'lucide-react';
import type { Route } from '@/lib/router';
import { linkHref } from '@/lib/router';

interface Props {
  onNavigate: (r: Route) => void;
}

interface AnimalOption {
  label: string;
  src: string;
}

const ANIMALS: AnimalOption[] = [
  { label: "Lion's Roar", src: '/Wake_The_Lion_Animated_v3.html' },
  { label: 'Rooster Crow', src: '/Rooster_Crow_Animated.html' },
  { label: "Dog's Bark", src: '/Dog_Bark_Animated.html' },
  { label: "Cat's Meow", src: '/Cat_Meow_Animated.html' },
];

export default function ZooPage({ onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden bg-black text-white"
      style={{ touchAction: 'none', overscrollBehavior: 'none' }}
    >
      {/* Top nav bar */}
      <header className="shrink-0 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <a
            href={linkHref('home')}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="group flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 ring-1 ring-white/15 transition-transform group-hover:scale-105">
              <Boxes className="h-5 w-5 text-cyan-300" />
            </div>
            <span className="text-sm font-bold tracking-[0.18em] text-white">
              ARCADE<span className="text-cyan-300">AI</span>
              <span className="text-red-500" style={{ textShadow: '0 0 6px rgba(239,68,68,0.6)' }}>
                {' '}
                3D
              </span>
            </span>
          </a>
        </nav>
      </header>

      {/* Content area: header box + dropdown + grid, fits viewport with no scroll */}
      <div
        className="flex min-h-0 flex-1 flex-col items-center"
        style={{ paddingTop: '6px', paddingBottom: '30px' }}
      >
        {/* Header box — reduced height, close to nav */}
        <div className="w-full max-w-md px-5">
          <div className="rounded-xl border-4 border-cyan-400/80 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 px-6 py-3 text-center shadow-lg shadow-cyan-500/20">
            <h1 className="text-2xl font-bold tracking-wide text-white sm:text-3xl">Aya Patting Zoo</h1>
          </div>
        </div>

        {/* Pat the Pet floating dropdown — mustard transparent */}
        <div className="relative mt-5 w-full max-w-md px-5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border-2 px-4 py-2.5 text-left transition-all"
            style={{
              borderColor: 'rgba(225, 173, 1, 0.6)',
              backgroundColor: 'rgba(225, 173, 1, 0.12)',
              color: '#ffdb4d',
            }}
          >
            <span className="flex items-center gap-2 text-sm font-semibold tracking-wide">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: '#e1ad01', boxShadow: '0 0 6px rgba(225,173,1,0.7)' }}
              />
              Pat the Pet
            </span>
            <span className="text-xs opacity-80">{ANIMALS[selected].label}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
              style={{ color: '#ffdb4d' }}
            />
          </button>

          {open && (
            <ul
              className="absolute left-5 right-5 z-20 mt-2 overflow-hidden rounded-lg border-2 shadow-2xl"
              style={{
                borderColor: 'rgba(225, 173, 1, 0.5)',
                backgroundColor: 'rgba(20, 16, 0, 0.92)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {ANIMALS.map((a, i) => (
                <li key={a.label}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(i);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors"
                    style={{
                      color: i === selected ? '#fff7d6' : '#ffdb4d',
                      backgroundColor: i === selected ? 'rgba(225,173,1,0.22)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (i !== selected) e.currentTarget.style.backgroundColor = 'rgba(225,173,1,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (i !== selected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="font-medium">{a.label}</span>
                    {i === selected && (
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: '#ffdb4d' }}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Grid: one responsive cell that fills the remaining space */}
        <div className="mt-5 flex min-h-0 w-full max-w-md flex-1 items-stretch px-5">
          <div className="grid min-h-0 min-w-0 h-full w-full grid-cols-1 grid-rows-1 overflow-hidden rounded-lg border-4 border-cyan-400/80 shadow-2xl shadow-cyan-500/20">
            <div className="min-h-0 min-w-0 overflow-hidden border-2 border-cyan-400/30">
              <iframe
                key={ANIMALS[selected].src}
                src={ANIMALS[selected].src}
                title={ANIMALS[selected].label}
                className="block h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
