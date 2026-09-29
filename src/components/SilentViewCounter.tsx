import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function SilentViewCounter() {
  const incremented = useRef(false);

  useEffect(() => {
    if (incremented.current) return;
    incremented.current = true;

    (async () => {
      try {
        await supabase.rpc('increment_page_view');
      } catch {
        // offline or not configured — silently ignore
      }
    })();
  }, []);

  return null;
}
