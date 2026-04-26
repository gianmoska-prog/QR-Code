(() => {
  'use strict';

  let wakeLock = null;

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js?v=ambience-2.1.0');
      await registration.update();
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  };

  const requestWakeLock = async () => {
    if (!('wakeLock' in navigator)) return;

    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
      });
    } catch (error) {
      wakeLock = null;
    }
  };

  window.addEventListener('load', () => {
    registerServiceWorker();
    requestWakeLock();
  }, { once: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') requestWakeLock();
  });
})();
