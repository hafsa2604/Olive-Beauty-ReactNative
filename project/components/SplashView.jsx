import { Image } from 'expo-image';
import { ActivityIndicator, ImageBackground, StyleSheet, Text, View } from 'react-native';

import { Images } from '@/constants/images';
import { APP_NAME, SageColors, Spacing } from '@/constants/theme';

export function SplashView() {
  return (
    <ImageBackground source={Images.background} style={styles.container} resizeMode="cover">
      <View style={styles.overlay} pointerEvents="none" />
      <View style={styles.content}>
        <Image source={Images.logo} style={styles.logo} contentFit="contain" />
        <Text style={styles.brand}>{APP_NAME}</Text>
        <Text style={styles.tagline}>Natural luxury · Self-care ritual</Text>
        <ActivityIndicator color={SageColors.primaryDark} style={styles.loader} size="small" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 248, 244, 0.72)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: Spacing.lg,
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: SageColors.primaryDark,
  },
  tagline: {
    fontSize: 15,
    color: SageColors.textMuted,
    marginTop: Spacing.sm,
    letterSpacing: 0.4,
    fontWeight: '500',
  },
  loader: {
    marginTop: Spacing.xxl,
  },
});
