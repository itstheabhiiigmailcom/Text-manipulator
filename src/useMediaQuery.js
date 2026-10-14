import { useEffect, useState } from 'react';

// Must match the `lg` breakpoint used in the CSS media queries.
export const COMPACT_QUERY = '(max-width: 991.98px)';

export const matches = (query) => typeof window !== 'undefined' && Boolean(window.matchMedia && window.matchMedia(query).matches);

export default function useMediaQuery(query) {
  const [value, setValue] = useState(() => matches(query));

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const list = window.matchMedia(query);
    const update = () => setValue(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);

  return value;
}
