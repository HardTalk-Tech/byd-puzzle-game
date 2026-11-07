"use client";

import { useCallback, useEffect, useRef } from "react";

/** setTimeout that is cleared automatically when the component unmounts. */
export function useTimeouts() {
  const ids = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const set = ids.current;
    return () => {
      set.forEach(clearTimeout);
      set.clear();
    };
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      ids.current.delete(id);
      fn();
    }, ms);
    ids.current.add(id);
    return id;
  }, []);

  const clearAll = useCallback(() => {
    ids.current.forEach(clearTimeout);
    ids.current.clear();
  }, []);

  return { schedule, clearAll };
}
