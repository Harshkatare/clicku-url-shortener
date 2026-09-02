import { useEffect, useState, useRef } from "react";

export function useAnimateCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const startTime = performance.now();

    function update(now: number) {
      const p = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }, [target, duration]);

  return count;
}
