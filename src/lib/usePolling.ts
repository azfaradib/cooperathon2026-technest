import { useEffect, useRef } from "react";

// Runs `load` on mount, every `ms`, and when the tab becomes visible again.
export function usePolling(load: () => void, ms = 10000) {
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    const run = () => {
      if (!document.hidden) loadRef.current();
    };
    run();
    const id = setInterval(run, ms);
    document.addEventListener("visibilitychange", run);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", run);
    };
  }, [ms]);
}
