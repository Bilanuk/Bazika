import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';
import { useEffect, useState } from 'react';

const fullConfig = resolveConfig(tailwindConfig);
const {
  theme: { screens },
} = fullConfig;
const useBreakpoint = (query: keyof typeof screens): boolean => {
  const mediaQuery = `(min-width: ${screens[query]})`;
  const matchQueryList = window.matchMedia(mediaQuery);
  const [isMatch, setMatch] = useState<boolean>(false);
  const onChange = (e: MediaQueryListEvent) => setMatch(e.matches);
  useEffect(() => {
    setMatch(matchQueryList.matches);
    matchQueryList.addEventListener('change', onChange);
    return () => matchQueryList.removeEventListener('change', onChange);
  }, [query, matchQueryList]);
  return isMatch;
};

export default useBreakpoint;
