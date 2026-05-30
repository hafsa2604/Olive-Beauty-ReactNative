import { Pressable, StyleSheet, Text } from 'react-native';

import { SageColors, Radius } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/types';

export function CategoryPill({ category, selected, onPress, label: customLabel }) {
  const label = customLabel ?? (category === 'all' ? 'All' : CATEGORY_LABELS[category]);
  return (
    <Pressable
      style={[styles.pill, selected && styles.pillSelected]}
      onPress={onPress}>
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: SageColors.white,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
    marginRight: 8,
  },
  pillSelected: {
    backgroundColor: SageColors.primary,
    borderColor: SageColors.primary,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: SageColors.text,
  },
  textSelected: {
    color: SageColors.white,
  },
});
