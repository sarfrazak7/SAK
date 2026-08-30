import { useState } from 'react';
import { Boxes, Menu, X, Gamepad2, Mail, MessageSquare } from 'lucide-react';
import type { Route } from '@/lib/router';
import { linkHref } from '@/lib/router';

interface Props {
  current: Route;
  onNavigate: (r: Route) => void;
}

export default function Navbar({ current, onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);

  const go = (r: Route) => {
    onNavigate(r);
    setOpen(false);
    setGamesOpen(false);
  };

  const isGame = current === 'crossword' || current === 'panagram' || current === 'tabletennis';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        {/* Logo */}
        <a
          href={linkHref('home')}
          onClick={(e) => { e.preventDefault(); go('home'); }}
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 ring-1 ring-white/15 transition-transform group-hover:scale-105">
            <Boxes className="h-5 w-5 text-cyan-300" />
          </div>
          <span className="text-sm font-bold tracking-[0.18em] text-white">ARCADE<span className="text-cyan-300">AI</span></span>
        </a>

        {/* Desktop nav */}
 <div className="hidden items-center gap-1 md:flex">
          {/* Games dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setGamesOpen(true)}
            onMouseLeave={() => setGamesOpen(false)}
          >
            <button
              onClick={() => setGamesOpen((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                isGame ? 'text-cyan-300' : 'text-white/70 hover:text-white'
              }`}
            >
              <Gamepad2 className="h-4 w-4" />
              Games
            </button>
            {gamesOpen && (
              <div className="absolute left-1/2 top-full w-56 -translate-x-1/2 pt-2">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c12]/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl">
                  <GameLink
                    label="Crossword Puzzle"
                    desc="3D cube word search"
                    active={current === 'crossword'}
                    onClick={() => go('crossword')}
                  />
                  <GameLink
                    label="Panagram"
                    desc="Letter arrangement"
                    active={current === 'panagram'}
                    onClick={() => go('panagram')}
                  />
                  <GameLink
                    label="Table Tennis"
                    desc="Fast-paced rally"
                    active={current === 'tabletennis'}
                    onClick={() => go('tabletennis')}
                  />
                </div>
              </div>
            )}
          </div>

          <NavLink active={current === 'contact'} onClick={() => go('contact')} icon={<Mail className="h-4 w-4" />}>
            Contact
          </NavLink>
          <NavLink active={current === 'feedback'} onClick={() => go('feedback')} icon={<MessageSquare className="h-4 w-4" />}>
            Feedback
          </NavLink>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-[#0c0c12]/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-[10px] font-bold tracking-widest text-white/30">GAMES</p>
            <MobileLink active={current === 'crossword'} onClick={() => go('crossword')}>Crossword Puzzle</MobileLink>
            <MobileLink active={current === 'panagram'} onClick={() => go('panagram')}>Panagram</MobileLink>
            <MobileLink active={current === 'tabletennis'} onClick={() => go('tabletennis')}>Table Tennis</MobileLink>
            <div className="my-2 h-px bg-white/10" />
            <MobileLink active={current === 'contact'} onClick={() => go('contact')}>Contact</MobileLink>
            <MobileLink active={current === 'feedback'} onClick={() => go('feedback')}>Feedback</MobileLink>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
        active ? 'text-cyan-300' : 'text-white/70 hover:text-white'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function GameLink({ label, desc, active, onClick }: { label: string; desc: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition ${
        active ? 'bg-cyan-500/10 ring-1 ring-cyan-400/30' : 'hover:bg-white/5'
      }`}
    >
      <span className={`text-sm font-semibold ${active ? 'text-cyan-300' : 'text-white/90'}`}>{label}</span>
      <span className="text-[11px] text-white/40">{desc}</span>
    </button>
  );
}

function MobileLink({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
        active ? 'bg-cyan-500/10 text-cyan-300' : 'text-white/70 hover:bg-white/5 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
