'use client';

import { useEffect, useState } from 'react';

/**
 * Returns a QA URL that phones can actually reach.
 * On localhost, swaps to the machine's LAN IP so QR codes work from mobile devices.
 */
export function useQaUrl(slug: string) {
  const [qaUrl, setQaUrl] = useState('');

  useEffect(() => {
    const origin = window.location.origin;
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!isLocal) {
      setQaUrl(`${origin}/qa/${slug}`);
      return;
    }

    // Fetch the machine's LAN IP from the API route
    fetch('/api/local-ip')
      .then((r) => r.json())
      .then(({ ip }) => {
        if (ip) {
          setQaUrl(`http://${ip}:${window.location.port}/qa/${slug}`);
        } else {
          // Fallback if no LAN IP found
          setQaUrl(`${origin}/qa/${slug}`);
        }
      })
      .catch(() => {
        setQaUrl(`${origin}/qa/${slug}`);
      });
  }, [slug]);

  return qaUrl;
}
