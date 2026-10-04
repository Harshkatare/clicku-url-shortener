import { useState, useEffect, useCallback } from "react";

const ONBOARDING_STORAGE_KEY = "shortlynk_onboarding_completed";

export function useOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (completed !== "true") {
        setIsOpen(true);
      }
    } catch {
      // LocalStorage restricted fallback
    }
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch {
      // Storage unavailable
    }
  }, []);

  const restartTour = useCallback(() => {
    setStep(1);
    setIsOpen(true);
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch {
      // Storage unavailable
    }
  }, []);

  const nextStep = useCallback(() => {
    setStep((prev) => (prev < 3 ? prev + 1 : prev));
  }, []);

  const prevStep = useCallback(() => {
    setStep((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  return {
    isOpen,
    step,
    nextStep,
    prevStep,
    closeTour,
    restartTour,
  };
}
