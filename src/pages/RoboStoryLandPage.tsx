import { useState } from 'react';
import { Bot, BookOpen, Sparkles, ArrowRight, Home } from 'lucide-react';
import { useRouter } from '@/lib/router';
import BackToHomeButton from '@/components/BackToHomeButton';
import SilentViewCounter from '@/components/SilentViewCounter';

interface Story {
  title: string;
  emoji: string;
  preview: string;
  body: string[];
}

const STORIES: Story[] = [
  {
    title: 'The Lonely Bolt',
    emoji: '🔩',
    preview: 'A tiny robot discovers that even the smallest part can hold everything together.',
    body: [
      'Bolt-12 was the smallest robot in the factory. While the great assembly arms swung overhead, Bolt-12 sat on a shelf, waiting.',
      'One day, the main line shuddered and stopped. A single bolt had come loose, halting everything.',
      'Without hesitation, Bolt-12 rolled to the center and locked the joint. The line roared back to life.',
      'And from that day on, every robot in the factory knew that even the smallest bolt can hold everything together.',
    ],
  },
  {
    title: 'Garden of Gears',
    emoji: '🌻',
    preview: 'A gardening robot learns that the best things grow with patience, not programming.',
    body: [
      'Unit-G was built for one purpose: to grow the perfect garden. It calculated soil pH, sun angles, and water flow to the milliliter.',
      'But the seeds refused to sprout on schedule. Unit-G ran diagnostics, recalibrated, and waited.',
      'Then a child wandered by and dropped a handful of wildflower seeds into the dirt. No plan, no calculation.',
      'Weeks later, a riot of color erupted where the wildflowers grew. Unit-G learned that the best things grow with patience, not programming.',
    ],
  },
  {
    title: 'The Courage Circuit',
    emoji: '⚡',
    preview: 'A cautious robot must cross the dark tunnel to deliver a message of hope.',
    body: [
      'Courier-7 was programmed for safe routes. Short trips, well-lit paths, no surprises.',
      'But the message had to reach the far village beyond the tunnel, and the tunnel was dark.',
      'Courage, the old robots said, is not the absence of fear. It is the decision to move forward anyway.',
      'Courier-7 entered the tunnel. Its lights flickered, its circuits buzzed with uncertainty, but it kept going. And when it emerged on the other side, the village cheered.',
    ],
  },
];

export default function RoboStoryLandPage() {
  const { navigate } = useRouter();
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#0d1024] to-[#0a0a1a] text-white">
      <BackToHomeButton compact />
      <SilentViewCounter />

      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/8 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-emerald-500/6 blur-[120px]" />
        <div className="absolute top-1/2 left-0 h-[350px] w-[350px] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-5 pb-24 pt-28 sm:px-8">
        {/* Hero */}
        <section className="text-center pt-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 backdrop-blur-sm">
            <Bot className="h-3.5 w-3.5 text-cyan-300" />
            <span className="text-[11px] font-medium tracking-widest text-white/60">AI STORY ADVENTURES</span>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 ring-1 ring-white/15">
                <Bot className="h-10 w-10 text-cyan-300" />
              </div>
              <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-amber-300 animate-pulse" />
            </div>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Robo<span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">Story</span>Land
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/55">
            Interactive robot tales where every choice shapes the adventure. Pick a story and begin your journey.
          </p>
        </section>

        {/* Story cards */}
        <section className="mt-16">
          <div className="mb-8 flex items-center justify-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-300" />
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Choose a Story</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STORIES.map((story) => (
              <button
                key={story.title}
                onClick={() => setActiveStory(story)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left transition hover:border-cyan-400/30 hover:scale-[1.03]"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-500/10 blur-2xl transition group-hover:bg-cyan-500/20" />
                <div className="relative mb-3 text-4xl">{story.emoji}</div>
                <h3 className="relative text-lg font-bold text-white">{story.title}</h3>
                <p className="relative mt-2 text-xs leading-relaxed text-white/50">{story.preview}</p>
                <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 transition group-hover:gap-2">
                  Read <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Coming soon teaser */}
        <section className="mx-auto mt-20 max-w-2xl text-center">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 p-8 backdrop-blur-sm">
            <Sparkles className="mx-auto mb-3 h-7 w-7 text-cyan-300" />
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">More adventures coming soon</h2>
            <p className="mt-2 text-sm text-white/50">
              New AI-generated stories are being crafted all the time. What kind of robot tale would you like to see next?
            </p>
            <button
              onClick={() => navigate('feedback')}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              Suggest a story
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Story modal */}
      {activeStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => setActiveStory(null)}
        >
          <div
            className="relative max-w-lg w-full rounded-3xl border border-white/15 bg-[#0c0c18]/95 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveStory(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <span className="text-lg">✕</span>
            </button>

            <div className="mb-4 text-5xl text-center">{activeStory.emoji}</div>
            <h2 className="mb-5 text-center text-2xl font-bold tracking-tight text-white">
              {activeStory.title}
            </h2>

            <div className="space-y-4">
              {activeStory.body.map((para, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-white/70 animate-fade-in"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveStory(null)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition hover:scale-105"
              >
                <Home className="h-4 w-4" />
                Back to stories
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
