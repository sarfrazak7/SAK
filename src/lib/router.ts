import { useState, useEffect, useCallback } from 'react';

export type Route = 'home' | 'crossword' | 'panagram' | 'tabletennis' | 'contact' | 'feedback';

const ROUTE_MAP: Record<string, Route> = {
  '': 'home',
  '/': 'home',
  '#': 'home',
  '#/': 'home',
  '#/crossword': 'crossword',
  '#/panagram': 'panagram',
  '#/tabletennis': 'tabletennis',
  '#/contact': 'contact',
  '#/feedback': 'feedback',
};

function parseHash(): Route {
  const h = window.location.hash.toLowerCase();
  return ROUTE_MAP[h] ?? 'home';
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: Route) => {
    const hash = to === 'home' ? '#/' : `#/${to}`;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRoute(to);
    }
    window.scrollTo(0, 0);
  }, []);

  return { route, navigate };
}

export function linkHref(to: Route): string {
  return to === 'home' ? '#/' : `#/${to}`;
}
