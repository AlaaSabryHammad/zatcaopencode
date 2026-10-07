'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/** URL query state for server-driven lists (search/sort/filter/page round-trip to the server). */
export function useListQuery(defaults: Record<string, string> = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const params = React.useMemo(() => {
    const o: Record<string, string> = { ...defaults };
    for (const [k, v] of sp.entries()) o[k] = v;
    return o;
  }, [sp, defaults]);

  const set = React.useCallback(
    (patch: Record<string, string | null | undefined>, opts?: { resetPage?: boolean }) => {
      const q = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === undefined || v === '') q.delete(k);
        else q.set(k, v);
      }
      if (opts?.resetPage !== false && !('page' in patch)) q.delete('page');
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [router, pathname, sp],
  );

  return { params, set };
}

/** Debounced text input value for search fields. */
export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
