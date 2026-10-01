import { useState, useEffect, useCallback } from 'react';

export type Route = 'home' | 'crossword' | 'crossword3d' | 'panagram' | 'tabletennis' | 'robostoryland' | 'contact' | 'feedback' | 'phonics';

const ROUTE_MAP: Record<string, Route> = {
  '': 'home',
  '/': 'home',
  '#': 'home',
  '#/': 'home',
  '#/crossword': 'crossword',
  '#/crossword3d': 'crossword3d',
  '#/panagram': 'panagram',
  '#/tabletennis': 'tabletennis',
  '#/contact': 'contact',
  '#/feedback': 'feedback',
  '#/robostoryland': 'robostoryland',
  '#/phonics': 'phonics',
};

function parseHash(): Route {
  // Check pathname first — supports direct visits like gamesai.dev/phonics
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  if (path && path !== '/' && ROUTE_MAP[`#${path}`]) {
    return ROUTE_MAP[`#${path}`];
  }
  const raw = window.location.hash.toLowerCase();
  // Strip query string / trailing slash so "#/crossword?cat=Space" still resolves
  const h = raw.split('?')[0].replace(/\/+$/, '') || raw;
  return ROUTE_MAP[h] ?? ROUTE_MAP[raw] ?? 'home';
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
