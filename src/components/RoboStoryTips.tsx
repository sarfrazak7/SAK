import { useEffect, useRef, useState, useCallback } from 'react';
import { Lightbulb, X, GripHorizontal } from 'lucide-react';

interface RoboStoryTipsProps {
  onClose: () => void;
}

const TIPS: { n: number; text: React.ReactNode }[] = [
  { n: 1, text: <>Tap the <strong>Play</strong> button to have the story read aloud. Tap again to <strong>pause</strong>, and tap once more to resume.</> },
  { n: 2, text: <>Use the <strong>category</strong> dropdown in the center to switch between Bedtime & Stars, Animal Pals, Magic & Fairytales, Little Adventures, Kindness & Friends, and Spooky Tales.</> },
  { n: 3, text: <>Tap the <strong>story list</strong> icon on the left to open a popup showing all 10 stories in the current category. Select any story to jump straight to it.</> },
  { n: 4, text: <>Use the <strong>language</strong> button in the top-right corner to hear stories in English, Español, 日本語, Français, اردو, or ਪੰਜਾਬੀ.</> },
  { n: 5, text: <>Press <strong>Next</strong> to skip to the following story, or <strong>Previous</strong> to go back. Stories auto-advance when one finishes.</> },
  { n: 6, text: <>Each category has its own <strong>ambient soundscape</strong> — crickets for bedtime, birds for animals, sparkles for magic, and thunder for spooky tales.</> },
  { n: 7, text: <>Toggle the <strong>ambient sound</strong> on or off with the sound icon button near the controls.</> },
  { n: 8, text: <>The story reader changes appearance based on the category — from a friendly robot to a wise old storyteller for Spooky Tales.</> },
  { n: 9, text: <>Words are highlighted one by one as the narrator reads, so you can follow along with the text.</> },
  { n: 10, text: <><strong>Add this web URL to your Home Screen</strong> — open your browser menu and tap "Add to Home Screen" so the app launches full-screen like a native app.</> },
];

export default function RoboStoryTips({ onClose }: RoboStoryTipsProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!windowRef.current) return;
    const el = windowRef.current;
    const w = el.offsetWidth || 360;
    const x = Math.max(8, window.innerWidth - w - 16);
    const y = Math.max(8, 72);
    setPos({ x, y });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    if (!windowRef.current) return;
    dragging.current = true;
    const rect = windowRef.current.getBoundingClientRect();
    dragOffset.current = { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  }, [startDrag]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, [startDrag]);

  useEffect(() => {
    const move = (clientX: number, clientY: number) => {
      if (!dragging.current || !windowRef.current) return;
      const el = windowRef.current;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const newX = Math.max(0, Math.min(window.innerWidth - w, clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - h, clientY - dragOffset.current.y));
      setPos({ x: newX, y: newY });
    };
    const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        e.preventDefault();
        move(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onEnd = () => { dragging.current = false; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50" style={{ pointerEvents: 'none' }}>
      <div
        ref={windowRef}
        className="reveal-popup-window"
        style={{
          pointerEvents: 'auto',
          position: 'absolute',
          width: 'min(380px, 92vw)',
          maxHeight: '82vh',
          left: pos ? pos.x : '50%',
          top: pos ? pos.y : '72px',
          transform: pos ? 'none' : 'translate(-50%, 0)',
          touchAction: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          className="reveal-popup-header"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          style={{ touchAction: 'none' }}
        >
          <GripHorizontal className="w-4 h-4 text-casino-gold/50 mx-auto" />
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <span className="prorec-led" aria-hidden="true">
                <span className="prorec-led-core" />
              </span>
              <div className="flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-casino-gold" />
                <p className="font-display text-sm font-bold tracking-widest text-gold-gradient">
                  STORYNOOK AI TIPS
                </p>
              </div>
            </div>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-casino-gold/15 text-gray-500 hover:text-casino-gold transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="h-px mx-4" style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />

        <div className="overflow-y-auto flex-1 px-4 py-3 reveal-popup-scroll">
          <div className="mb-3">
            <p className="font-display text-[11px] text-casino-gold tracking-wider mb-1">
              AI-powered storytelling for kids
            </p>
          </div>

          <ol className="space-y-2.5">
            {TIPS.map((tip) => (
              <li key={tip.n} className="flex gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-casino-gold/15 border border-casino-gold/40 flex items-center justify-center font-display text-[10px] text-casino-gold font-bold">
                  {tip.n}
                </span>
                <p className="font-body text-[12px] leading-relaxed text-gray-300">
                  {tip.text}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="reveal-popup-footer">
          <p className="font-body text-xs text-gray-600 text-center">
            Drag header to move
          </p>
        </div>
      </div>
    </div>
  );
}
