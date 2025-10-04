import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for polling with visibility detection and error backoff
 * @param {Function} fn - The async function to poll
 * @param {number} intervalMs - Base polling interval in milliseconds
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether polling is enabled (default: true)
 * @param {number} options.maxBackoff - Maximum backoff interval in ms (default: 5 minutes)
 * @param {number} options.backoffMultiplier - Multiplier for backoff (default: 2)
 * @param {number} options.maxErrors - Max consecutive errors before stopping (default: 5)
 */
export function usePolling(
  fn,
  intervalMs,
  {
    enabled = true,
    maxBackoff = 5 * 60 * 1000,
    backoffMultiplier = 2,
    maxErrors = 5,
  } = {}
) {
  const timeoutRef = useRef(null);
  const isVisibleRef = useRef(true);
  const currentIntervalRef = useRef(intervalMs);
  const errorCountRef = useRef(0);
  const isPollingRef = useRef(false);

  // Reset interval and error count
  const resetBackoff = useCallback(() => {
    currentIntervalRef.current = intervalMs;
    errorCountRef.current = 0;
  }, [intervalMs]);

  // Apply backoff on error
  const applyBackoff = useCallback(() => {
    errorCountRef.current += 1;

    if (errorCountRef.current >= maxErrors) {
      console.warn(`Polling stopped after ${maxErrors} consecutive errors`);
      return false; // Stop polling
    }

    currentIntervalRef.current = Math.min(
      currentIntervalRef.current * backoffMultiplier,
      maxBackoff
    );

    console.log(
      `Polling backoff applied: ${currentIntervalRef.current}ms (error ${errorCountRef.current}/${maxErrors})`
    );

    return true; // Continue polling
  }, [maxErrors, maxBackoff, backoffMultiplier]);

  // Execute the polling function
  const executePoll = useCallback(async () => {
    if (!enabled || !isVisibleRef.current || isPollingRef.current) {
      return;
    }

    isPollingRef.current = true;

    try {
      await fn();
      resetBackoff(); // Reset on success
    } catch (error) {
      console.error("Polling error:", error);
      const shouldContinue = applyBackoff();

      if (!shouldContinue) {
        isPollingRef.current = false;
        return; // Stop polling
      }
    } finally {
      isPollingRef.current = false;
    }

    // Schedule next poll if still enabled and visible
    if (enabled && isVisibleRef.current) {
      timeoutRef.current = setTimeout(executePoll, currentIntervalRef.current);
    }
  }, [fn, enabled, resetBackoff, applyBackoff]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      isVisibleRef.current = isVisible;

      if (isVisible && enabled) {
        // Resume polling when tab becomes visible
        console.log("Tab visible - resuming polling");
        resetBackoff(); // Reset backoff when resuming
        executePoll();
      } else {
        // Pause polling when tab is hidden
        console.log("Tab hidden - pausing polling");
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, executePoll, resetBackoff]);

  // Start/stop polling based on enabled flag
  useEffect(() => {
    if (enabled && isVisibleRef.current) {
      // Start polling
      executePoll();
    } else {
      // Stop polling
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [enabled, executePoll]);

  // Return control functions
  return {
    reset: resetBackoff,
    trigger: executePoll,
  };
}
