import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface UseAutoLogoutOptions {
  timeoutSeconds: number;
  onLogout?: () => void;
}

export function useAutoLogout({ timeoutSeconds, onLogout }: UseAutoLogoutOptions) {
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    toast.info("Session expired due to inactivity");
    await logout();
    onLogout?.();
  }, [logout, onLogout]);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    if (!isAuthenticated) return;

    // Set warning at 10 seconds before logout
    const warningTime = Math.max((timeoutSeconds - 10) * 1000, 0);
    warningRef.current = setTimeout(() => {
      toast.warning("You will be logged out in 10 seconds due to inactivity", {
        duration: 5000,
      });
    }, warningTime);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutSeconds * 1000);
  }, [timeoutSeconds, isAuthenticated, handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Events that indicate user activity
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [isAuthenticated, resetTimer]);

  return { resetTimer };
}
