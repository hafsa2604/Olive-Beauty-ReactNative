import { StyleSheet, View } from 'react-native';

import { SageColors, Radius, Shadows, Spacing } from '@/constants/theme';

export function GlassCard({ children, style, ...rest }) {
  return (
    <View style={[styles.card, Shadows.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SageColors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
    padding: Spacing.md,
  },
});
