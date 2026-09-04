import { useEffect, useRef, useState, useCallback } from 'react';
import { Lightbulb, X, GripHorizontal } from 'lucide-react';

interface CrosswordProTipsProps {
  onClose: () => void;
}

const TIPS: { n: number; text: React.ReactNode }[] = [
  { n: 1, text: <>Drag across letters on the cube face to select a hidden word.</> },
  { n: 2, text: <>Swipe a <strong>red hand icon</strong> in any direction to spin the cube to the next face.</> },
  { n: 3, text: <>Each face has a <strong>5-minute timer</strong> that auto-advances when it runs out.</> },
  { n: 4, text: <>Clear a face <strong>fast</strong> to earn <strong>time bonus points</strong> — up to 1000!</> },
  { n: 5, text: <>Use <strong>Reveal</strong> to highlight all words on the current face.</> },
  { n: 6, text: <>There are <strong>6 faces</strong> on the cube, each with its own theme. Clear them all!</> },
];

export default function CrosswordProTips({ onClose }: CrosswordProTipsProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!windowRef.current) return;
    const el = windowRef.current;
    const w = el.offsetWidth || 360;
    const h = el.offsetHeight || 420;
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
                  CROSSWORD PRO TIPS
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
              A 3D cube crossword puzzle game
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

          <div className="mt-4 pt-3 border-t border-casino-gold/15">
            <p className="font-display text-[11px] text-casino-gold tracking-wider mb-1">
              Time Bonus (per face)
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1.5">
              {[
                ['≤2 min', '1000'],
                ['≤3 min', '500'],
                ['≤4 min', '300'],
                ['≤5 min', '100'],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between font-body text-[11px]">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-casino-gold font-bold">{val}</span>
                </div>
              ))}
            </div>
          </div>
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
