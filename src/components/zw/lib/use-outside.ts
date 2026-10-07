'use client';

import { useEffect, type RefObject } from 'react';

/** Calls `cb` on outside mousedown or Escape while `active`. */
export function useOutside(ref: RefObject<HTMLElement | null>, active: boolean, cb: () => void) {
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cb();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [active, cb, ref]);
}

/** Controlled/uncontrolled value helper. */
export function isControlled<T>(value: T | undefined): value is T {
  return value !== undefined;
}
