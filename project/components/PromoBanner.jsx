import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { SageColors, Radius, Shadows, Spacing } from '@/constants/theme';

export function PromoBanner({ onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.wrap, Shadows.card]}>
      <LinearGradient
        colors={[SageColors.bannerStart, SageColors.bannerEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <View style={styles.textBlock}>
          <Text style={styles.eyebrow}>NEW COLLECTION</Text>
          <Text style={styles.title}>Matcha Glow{'\n'}Skincare Ritual</Text>
          <Text style={styles.sub}>Clean ingredients · Dermatologist tested</Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Shop now</Text>
            <Ionicons name="arrow-forward" size={16} color={SageColors.white} />
          </View>
        </View>
        <View style={styles.decor}>
          <Ionicons name="leaf" size={72} color="rgba(255,255,255,0.25)" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  gradient: {
    flexDirection: 'row',
    padding: Spacing.lg,
    minHeight: 148,
  },
  textBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: SageColors.white,
    lineHeight: 28,
  },
  sub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    marginBottom: Spacing.sm,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  ctaText: {
    color: SageColors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  decor: {
    justifyContent: 'center',
    paddingLeft: Spacing.sm,
  },
});
