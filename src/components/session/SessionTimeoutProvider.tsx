'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';

// Log the user out after this long with no interaction on the page.
const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours
// Show the "you're about to be logged out" warning this long before the cutoff.
const WARNING_BEFORE_MS = 2 * 60 * 1000; // 2 minutes
// Skip writes to localStorage on every mousemove/keydown - only persist activity this often.
const ACTIVITY_WRITE_THROTTLE_MS = 5000;

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'] as const;

const LAST_ACTIVITY_KEY = 'session_last_activity';
const LOGOUT_BROADCAST_KEY = 'session_logout_broadcast';

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logoutStore = useAuthStore((state) => state.logout);
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(false);
  const [remainingMs, setRemainingMs] = useState(WARNING_BEFORE_MS);

  // Refs (not state) drive the timing logic so the 1s interval doesn't churn re-renders.
  const lastActivityRef = useRef(Date.now());
  const showWarningRef = useRef(false);
  const lastWriteRef = useRef(0);
  // Guards against the 1s interval (or visibilitychange) re-triggering performLogout while
  // the first call's API request is still in flight - without this, a round-trip slower
  // than 1s causes a second logout+redirect before isAuthenticated flips to false.
  const loggingOutRef = useRef(false);

  const performLogout = useCallback(
    async (broadcast: boolean) => {
      if (loggingOutRef.current) return;
      loggingOutRef.current = true;

      if (broadcast) {
        try {
          localStorage.setItem(LOGOUT_BROADCAST_KEY, String(Date.now()));
        } catch {
          // localStorage unavailable (e.g. private browsing) - fall back to single-tab logout
        }
      }
      try {
        await authService.logout();
      } catch {
        // Best-effort server logout; proceed with local cleanup regardless
      } finally {
        logoutStore();
        router.push('/auth/login?expired=true&reason=inactivity');
      }
    },
    [logoutStore, router],
  );

  const resetActivity = useCallback((persist: boolean) => {
    lastActivityRef.current = Date.now();
    if (showWarningRef.current) {
      showWarningRef.current = false;
      setShowWarning(false);
    }
    if (persist) {
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(lastActivityRef.current));
      } catch {
        // ignore
      }
    }
  }, []);

  // Passive activity tracking. Once the warning is showing, activity no longer resets the
  // timer implicitly - the user must explicitly click "Stay Signed In" to acknowledge it.
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      if (showWarningRef.current) return;

      const now = Date.now();
      if (now - lastWriteRef.current < ACTIVITY_WRITE_THROTTLE_MS) {
        lastActivityRef.current = now;
        return;
      }
      lastWriteRef.current = now;
      resetActivity(true);
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [isAuthenticated, resetActivity]);

  // Cross-tab sync: activity in one tab resets the clock in all tabs, and a logout in one
  // tab (idle or manual) logs out every open tab.
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LAST_ACTIVITY_KEY && event.newValue) {
        const ts = Number(event.newValue);
        if (!Number.isNaN(ts) && ts > lastActivityRef.current) {
          resetActivity(false);
        }
      }
      if (event.key === LOGOUT_BROADCAST_KEY && event.newValue) {
        logoutStore();
        router.push('/auth/login?expired=true&reason=inactivity');
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isAuthenticated, resetActivity, logoutStore, router]);

  // Main clock: checks elapsed idle time once a second. Wall-clock comparison (Date.now())
  // means throttled background-tab timers still resolve correctly once they do fire.
  useEffect(() => {
    if (!isAuthenticated) {
      showWarningRef.current = false;
      setShowWarning(false);
      return;
    }

    // Fresh authenticated session (e.g. just logged back in) - clear the guard from any
    // prior logout so this session's own idle timeout can fire.
    loggingOutRef.current = false;

    // Resume from a persisted timestamp if one exists, rather than always starting a fresh
    // window on mount - otherwise fully closing and reopening the browser (tokens still
    // valid) would silently grant another full timeout period regardless of how long the
    // user was actually away.
    let stored: number | null = null;
    try {
      const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
      stored = raw ? Number(raw) : null;
    } catch {
      stored = null;
    }

    if (stored && !Number.isNaN(stored)) {
      lastActivityRef.current = stored;
    } else {
      resetActivity(true);
    }

    const check = () => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = IDLE_TIMEOUT_MS - elapsed;

      if (remaining <= 0) {
        performLogout(true);
        return;
      }

      if (remaining <= WARNING_BEFORE_MS) {
        showWarningRef.current = true;
        setShowWarning(true);
        setRemainingMs(remaining);
      }
    };

    // Catch up immediately - covers reopening the browser (or waking from sleep) after
    // already having been idle past the limit, instead of waiting for the next tick.
    check();

    const interval = setInterval(check, 1000);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', check);
    };
  }, [isAuthenticated, performLogout, resetActivity]);

  // Clear the persisted timestamp on logout so the next login (possibly a different user
  // in the same browser) doesn't inherit a stale activity time.
  useEffect(() => {
    if (isAuthenticated) return;
    try {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !showWarning) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-5">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 rounded-full bg-amber-50">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <h3 className="text-md md:text-lg font-bold text-gray-900">You&apos;re about to be signed out</h3>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
              You&apos;ve been inactive for a while. For your security, you&apos;ll be logged out in{' '}
              <span className="font-bold text-gray-900">{formatCountdown(remainingMs)}</span>.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              size='sm'
              onClick={() => performLogout(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-sm"
            >
              Log Out Now
            </Button>
            <Button
              type="button"
              size='sm'
              onClick={() => resetActivity(true)}
              className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-sm"
            >
              Stay Signed In
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
