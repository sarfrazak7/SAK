import { useEffect } from 'react';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import BackToHomeButton from '@/components/BackToHomeButton';

const EXTERNAL_URL = 'https://project-bolt-sb1-6ihfsfph.bolt.host';

export default function RoboStoryLandPage() {
  useEffect(() => {
    window.location.replace(EXTERNAL_URL);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#0d1024] to-[#0a0a1a] text-white">
      <BackToHomeButton compact />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/8 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-emerald-500/6 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 ring-1 ring-white/15">
            <Bot className="h-10 w-10 text-cyan-300" />
          </div>
          <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-amber-300 animate-pulse" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Robo<span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">Story</span>Land
        </h1>

        <div className="flex items-center gap-2 text-white/50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading your adventure...</span>
        </div>

        <a
          href={EXTERNAL_URL}
          className="mt-2 text-sm font-semibold text-cyan-300 underline-offset-4 hover:underline"
        >
          Click here if you're not redirected
        </a>
      </div>
    </div>
  );
}
