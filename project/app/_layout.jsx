import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppProvider } from '@/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SageColors } from '@/constants/theme';

const MatchaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: SageColors.primary,
    background: SageColors.cream,
    card: SageColors.card,
    text: SageColors.text,
    border: SageColors.cardBorder,
  },
};

const MatchaDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: SageColors.primary,
    background: SageColors.cream,
    card: SageColors.card,
    text: SageColors.text,
    border: SageColors.cardBorder,
  },
};

const stackScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: SageColors.cream },
  headerStyle: { backgroundColor: SageColors.cream },
  headerTintColor: SageColors.text,
  headerTitleStyle: { color: SageColors.text, fontWeight: '600' },
  headerShadowVisible: false,
};

function RootNavigation() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? MatchaDarkTheme : MatchaTheme}>
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="category/[category]" options={{ headerShown: true }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: true, title: 'Product' }} />
        <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
        <Stack.Screen name="orders" options={{ headerShown: true, title: 'Orders' }} />
        <Stack.Screen name="wishlist" options={{ headerShown: true, title: 'Wishlist' }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: true, title: 'Edit Profile' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigation />
    </AppProvider>
  );
}
