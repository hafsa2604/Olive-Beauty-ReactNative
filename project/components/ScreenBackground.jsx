import { ImageBackground, StyleSheet, View } from 'react-native';

import { Images } from '@/constants/images';
import { SageColors } from '@/constants/theme';

/**
 * Full-screen background. Use `nested` on child screens when the root layout
 * already renders the same background (avoids double image / dark overlay).
 */
export function ScreenBackground({
  children,
  style,
  overlayOpacity = 0.35,
  nested = false,
  ...rest
}) {
  if (nested) {
    return (
      <View style={[styles.content, style]} {...rest}>
        {children}
      </View>
    );
  }

  const [r, g, b] = SageColors.overlayBase;

  return (
    <ImageBackground source={Images.background} style={styles.background} resizeMode="cover">
      <View
        style={[styles.overlay, { backgroundColor: `rgba(${r}, ${g}, ${b}, ${overlayOpacity})` }]}
        pointerEvents="none"
      />
      <View style={[styles.content, style]} {...rest}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
});
