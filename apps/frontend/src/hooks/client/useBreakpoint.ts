import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';
import { useEffect, useState } from 'react';

const fullConfig = resolveConfig(tailwindConfig);
const {
  theme: { screens },
} = fullConfig;

const useBreakpoint = (query: keyof typeof screens): boolean => {
  const [isMatch, setMatch] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = `(min-width: ${screens[query]})`;
    const matchQueryList = window.matchMedia(mediaQuery);
    const onChange = (e: MediaQueryListEvent) => setMatch(e.matches);

    setMatch(matchQueryList.matches);
    matchQueryList.addEventListener('change', onChange);

    return () => matchQueryList.removeEventListener('change', onChange); // Cleanup
  }, [query]);

  return isMatch;
};

export default useBreakpoint;
