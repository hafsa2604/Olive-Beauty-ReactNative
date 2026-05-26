import { StyleSheet, Text, TextInput, View } from 'react-native';

import { SageColors, Radius, Spacing } from '@/constants/theme';

export function AppInput({ label, error, style, ...rest }) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={SageColors.textMuted}
        style={[styles.input, error && styles.inputError, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: SageColors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: SageColors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: SageColors.text,
  },
  inputError: {
    borderColor: SageColors.danger,
  },
  error: {
    color: SageColors.danger,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});
