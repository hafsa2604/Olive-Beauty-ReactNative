import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ADMIN_EMAIL, ADMIN_PASSWORD } from '@/constants/auth';
import { SageColors, Radius, Spacing } from '@/constants/theme';

export function AdminCredentialsCard({ compact = false }) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={22} color={SageColors.primary} />
        <Text style={styles.title}>Admin login</Text>
      </View>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value} selectable>
        {ADMIN_EMAIL}
      </Text>
      <Text style={styles.label}>Password</Text>
      <Text style={styles.value} selectable>
        {ADMIN_PASSWORD}
      </Text>
      {!compact ? (
        <Text style={styles.note}>
          Sign in with these credentials to open the Admin tab: manage products, orders, and
          users. If admin login fails, reset or delete admin@olivebeauty.com in Firebase
          Authentication, then sign in again to recreate the demo account.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  cardCompact: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: SageColors.text,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: SageColors.textMuted,
    marginTop: Spacing.xs,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: SageColors.primary,
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    color: SageColors.textMuted,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
});
