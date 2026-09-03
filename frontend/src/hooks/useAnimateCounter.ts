import { useEffect, useState, useRef } from "react";

export function useAnimateCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    if (!target || countRef.current === target) return;

    const startVal = countRef.current;
    const startTime = performance.now();
    let frameId: number;

    function update(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      // Cubic ease-out: rapid acceleration followed by smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(startVal + easeOut * (target - startVal));

      if (nextVal !== countRef.current) {
        countRef.current = nextVal;
        setCount(nextVal);
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      }
    }

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return count;
}
