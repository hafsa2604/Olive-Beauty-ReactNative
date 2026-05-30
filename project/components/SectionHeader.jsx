import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SageColors, Spacing } from '@/constants/theme';

export function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: SageColors.text,
    letterSpacing: -0.3,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    color: SageColors.primary,
  },
});
