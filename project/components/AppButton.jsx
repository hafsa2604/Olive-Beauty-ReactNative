import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { SageColors, Radius, Spacing } from '@/constants/theme';

export function AppButton({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  activeOpacity = 0.85,
  ...rest
}) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
      disabled={disabled || loading}
      activeOpacity={activeOpacity}
      accessibilityRole="button"
      {...rest}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? SageColors.primary : SageColors.white} />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: SageColors.primary,
  },
  secondary: {
    backgroundColor: SageColors.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: SageColors.primary,
  },
  danger: {
    backgroundColor: SageColors.danger,
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    color: SageColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: SageColors.primary,
  },
});
