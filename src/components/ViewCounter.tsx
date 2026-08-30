import { useState, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ViewCounter() {
  const [count, setCount] = useState<number | null>(null);
  const incremented = useRef(false);

  useEffect(() => {
    if (incremented.current) return;
    incremented.current = true;

    (async () => {
      try {
        const { data, error } = await supabase.rpc('increment_page_view');
        if (!error && typeof data === 'number') {
          setCount(data);
          return;
        }
        const { data: row } = await supabase
          .from('page_views')
          .select('count')
          .eq('id', 1)
          .maybeSingle();
        if (row) setCount(row.count);
      } catch {
        // offline or not configured
      }
    })();
  }, []);

  const padded = count !== null ? count.toString().padStart(5, '0') : '00000';

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-sm">
      <Eye className="h-3.5 w-3.5 text-cyan-300/70" />
      <span className="text-[11px] font-medium tracking-[0.2em] text-white/40">VIEWS</span>
      <span className="font-mono text-sm font-bold tabular-nums tracking-wider text-cyan-300">
        {padded}
      </span>
    </div>
  );
}
