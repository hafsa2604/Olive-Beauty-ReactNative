import { Redirect, Stack } from 'expo-router';

import { ScreenBackground } from '@/components/ScreenBackground';
import { useApp } from '@/context/AppContext';
import { SageColors } from '@/constants/theme';

export default function AdminLayout() {
  const { user, ready } = useApp();

  if (ready && user?.role !== 'admin') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <ScreenBackground nested overlayOpacity={0.35}>
      <Stack
        screenOptions={{
          headerTransparent: true,
          headerTintColor: SageColors.white,
          headerTitleStyle: { color: SageColors.white, fontWeight: '600' },
          contentStyle: { backgroundColor: 'transparent' },
        }}>
        <Stack.Screen name="index" options={{ title: 'Admin Dashboard' }} />
        <Stack.Screen name="products" options={{ title: 'Manage Products' }} />
        <Stack.Screen name="product-form" options={{ title: 'Product' }} />
        <Stack.Screen name="orders" options={{ title: 'Manage Orders' }} />
        <Stack.Screen name="users" options={{ title: 'Manage Users' }} />
        <Stack.Screen name="reviews" options={{ title: 'Manage Reviews' }} />
      </Stack>
    </ScreenBackground>
  );
}
