'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { fetchMe, type AppMe } from './me-api';

export function useAppMe() {
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const [me, setMe] = useState<AppMe | null>(null);
  const [loading, setLoading] = useState(true);

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

      const token = await getToken();
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
  }, [getToken, isLoaded, isSignedIn]);

  return { me, loading };
}
