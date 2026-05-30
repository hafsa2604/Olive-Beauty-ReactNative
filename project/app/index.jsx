import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import { appHref } from '@/lib/href';
import { SplashView } from '@/components/SplashView';
import { useApp } from '@/context/AppContext';

export default function Index() {
  const { ready, user } = useApp();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => setSplashDone(true), 2400);
    return () => clearTimeout(timer);
  }, [ready]);

  if (!ready || !splashDone) {
    return <SplashView />;
  }

  if (!user) {
    return <Redirect href={appHref('/(auth)/login')} />;
  }

  return <Redirect href={appHref('/(tabs)')} />;
}
