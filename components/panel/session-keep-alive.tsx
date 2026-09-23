'use client';

import { useEffect } from 'react';

const refreshIntervalMs = 24 * 60 * 60 * 1_000;

async function refreshSession() {
  try {
    await fetch('/api/auth/session/refresh', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
  } catch {
    // A temporary network failure should not interrupt the panel experience.
  }
}

export function SessionKeepAlive() {
  useEffect(() => {
    void refreshSession();
    const timer = window.setInterval(
      () => void refreshSession(),
      refreshIntervalMs,
    );
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
