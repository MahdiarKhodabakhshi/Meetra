'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';
import { fetchMe, type AppMe } from './me-api';

export function useAppMe() {
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const [me, setMe] = useState<AppMe | null>(null);
  const [loading, setLoading] = useState(true);

  // Stabilize getToken so it doesn't trigger re-fetches on every render.
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        if (mounted) {
          setMe(null);
          setLoading(false);
        }
        return;
      }

      const token = await getTokenRef.current();
      if (!token) {
        if (mounted) {
          setMe(null);
          setLoading(false);
        }
        return;
      }

      const { data } = await fetchMe(token);

      if (mounted) {
        setMe(data ?? null);
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn]);

  return { me, loading };
}
