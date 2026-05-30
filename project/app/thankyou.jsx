import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { MatchaScreen } from '@/components/MatchaScreen';
import { appHref } from '@/lib/href';
import { SageColors, Spacing } from '@/constants/theme';

export default function ThankYouScreen() {
  return (
    <MatchaScreen edges={true}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={80} color={SageColors.primary} />
        </View>
        <Text style={styles.title}>Thank you for shopping</Text>
        <Text style={styles.subtitle}>
          Your order has been placed successfully and will be processed soon.
        </Text>
        <AppButton
          title="Continue Shopping"
          onPress={() => router.replace(appHref('/(tabs)'))}
          style={styles.button}
        />
      </View>
    </MatchaScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconWrap: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: SageColors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: SageColors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    maxWidth: 300,
  },
});
