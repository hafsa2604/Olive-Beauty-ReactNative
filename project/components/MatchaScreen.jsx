import { ImageBackground, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Images } from '@/constants/images';
import { SageColors } from '@/constants/theme';

export function MatchaScreen({ children, style, edges = true, gradient = true, ...rest }) {
  const insets = useSafeAreaInsets();
  const paddingTop = edges ? insets.top : 0;
  const paddingBottom = edges ? insets.bottom : 0;

  return (
    <ImageBackground source={Images.background} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} pointerEvents="none" />
      <View style={[styles.content, { paddingTop, paddingBottom }, style]} {...rest}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  content: {
    flex: 1,
  },
});
