"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export const useAutoReturnTimer = (
  step: number,
  setStep: (step: number) => void,
  timeoutDuration: number = 120 // Default 2 minutes
) => {
  const [remainingTime, setRemainingTime] = useState(timeoutDuration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAutoReturnTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRemainingTime(timeoutDuration);
  }, [timeoutDuration]);

  const startTimer = useCallback(() => {
    clearAutoReturnTimer(); // Clear any existing timers
    setRemainingTime(timeoutDuration);

    // Start countdown interval
    intervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          setStep(1); // Return to step 1
          clearAutoReturnTimer();
          return timeoutDuration;
        }
        return prev - 1;
      });
    }, 1000);

    // Set main timeout
    timerRef.current = setTimeout(() => {
      setStep(1);
      clearAutoReturnTimer();
    }, timeoutDuration * 1000);
  }, [timeoutDuration, setStep, clearAutoReturnTimer]);

  useEffect(() => {
    if (step === 2) {
      startTimer();
    } else {
      clearAutoReturnTimer();
    }

    return () => {
      clearAutoReturnTimer();
    };
  }, [step, startTimer, clearAutoReturnTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoReturnTimer();
    };
  }, [clearAutoReturnTimer]);

  return {
    remainingTime,
    clearAutoReturnTimer,
  };
};
