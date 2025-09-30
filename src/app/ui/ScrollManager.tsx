'use client';

import { useEffect } from 'react';

export function ScrollManager() {
  useEffect(() => {
    let activityTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      document.body.classList.add('is-active');

      clearTimeout(activityTimeout);

      activityTimeout = setTimeout(() => {
        document.body.classList.remove('is-active');
      }, 1500);
    };

    const events: (keyof WindowEventMap)[] = [
      'scroll',
      'mousemove',
      'keydown',
      // 'touchstart'
    ];

    events.forEach(e =>
      window.addEventListener(e, handleActivity, { passive: true })
    );

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      clearTimeout(activityTimeout);
    };
  }, []);

  return null;
}
