import { useState, useRef, useCallback, useEffect } from "react";

export interface UseProcessingTimerOptions {
  duration?: number; // Estimated duration in ms
  startProgress?: number; // Start from e.g. 10%
  endProgress?: number; // Cap at e.g. 90%
  incrementInterval?: number;
}

export function useProcessingTimer() {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback((options: UseProcessingTimerOptions = {}) => {
    const {
      duration = 5000,
      startProgress = 0,
      endProgress = 90,
      incrementInterval = 500,
    } = options;

    // Reset
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(startProgress);

    // Calculate increment step to reach endProgress in duration
    // steps = duration / incrementInterval
    // totalGain = endProgress - startProgress
    // gainPerStep = totalGain / steps
    const steps = duration / incrementInterval;
    const gainPerStep = (endProgress - startProgress) / steps;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + gainPerStep;
        if (next >= endProgress) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return endProgress;
        }
        return next;
      });
    }, incrementInterval);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Force specific value (e.g. 100% on complete)
  const set = useCallback(
    (value: number) => {
      stop();
      setProgress(value);
    },
    [stop]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    progress,
    start,
    stop,
    set,
  };
}
