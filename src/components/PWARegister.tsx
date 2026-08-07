"use client";

import { useEffect } from "react";

// Registers the service worker so the site can be installed to the home screen
// and open like an app. Fails silently on unsupported browsers.
export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
