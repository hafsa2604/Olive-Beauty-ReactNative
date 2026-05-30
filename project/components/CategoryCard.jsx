import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { SageColors, Radius, Shadows, Spacing } from '@/constants/theme';

const CATEGORY_META = {
  skincare: { label: 'Skincare', icon: 'water-outline', tint: '#E4EDE1' },
  haircare: { label: 'Hair Care', icon: 'flower-outline', tint: '#E8EDE4' },
};

export function CategoryCard({ category, onPress }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.skincare;

  return (
    <Pressable style={[styles.card, Shadows.soft]} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: meta.tint }]}>
        <Ionicons name={meta.icon} size={26} color={SageColors.primary} />
      </View>
      <Text style={styles.label}>{meta.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: SageColors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
    marginHorizontal: 4,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: SageColors.text,
  },
});
