import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { GlassCard } from '@/components/GlassCard';
import { KeyboardAwareForm } from '@/components/KeyboardAwareForm';
import { MatchaScreen } from '@/components/MatchaScreen';
import { sendPasswordReset } from '../../services/authService';
import { APP_NAME, SageColors, Spacing } from '@/constants/theme';
import { showAlert } from '@/lib/feedback';
import { appHref } from '@/lib/href';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    Keyboard.dismiss();
    setFormError(null);

    if (!email.trim()) {
      const message = 'Please enter your email address.';
      setFormError(message);
      showAlert('Missing fields', message);
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccess(true);
      showAlert(
        'Email Sent',
        'We have sent a secure password reset link to your email. Please check your inbox (and spam folder).'
      );
    } catch (error) {
      console.error('Password reset error:', error);
      let message = 'Could not send reset email. Please try again.';
      if (error.code === 'auth/invalid-email') message = 'Invalid email address format';
      if (error.code === 'auth/user-not-found') message = 'No account matches this email';
      setFormError(message);
      showAlert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MatchaScreen>
      <KeyboardAwareForm contentContainerStyle={styles.scroll} extraBottomPadding={40}>
          <Text style={styles.brand}>{APP_NAME}</Text>
          <Text style={styles.tagline}>Restore your beauty ritual</Text>

          <GlassCard style={styles.card}>
            <Text style={styles.title}>Reset Password</Text>
            
            {!success ? (
              <>
                <Text style={styles.description}>
                  Enter the email address associated with your account. We will send you a secure link to reset your password.
                </Text>
                <AppInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="you@email.com"
                  returnKeyType="done"
                  onSubmitEditing={handleReset}
                />
                {formError ? <Text style={styles.formError}>{formError}</Text> : null}
                <AppButton title="Send Reset Link" onPress={handleReset} loading={loading} />
              </>
            ) : (
              <View style={styles.successWrap}>
                <Text style={styles.successTitle}>Reset Email Sent!</Text>
                <Text style={styles.successDescription}>
                  A recovery link has been successfully dispatched to {email.toLowerCase()}. Please follow the instructions in the email to restore your credentials.
                </Text>
                <AppButton title="Back to Sign In" onPress={() => router.replace(appHref('/(auth)/login'))} />
              </View>
            )}
          </GlassCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remembered your credentials? </Text>
            <Link href={appHref('/(auth)/login')} style={styles.link}>
              Sign in
            </Link>
          </View>
      </KeyboardAwareForm>
    </MatchaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingTop: 80,
  },
  brand: {
    fontSize: 36,
    fontWeight: '700',
    color: SageColors.text,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 15,
    color: SageColors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.xs,
  },
  card: {
    marginTop: Spacing.md,
    padding: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: SageColors.text,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 14,
    color: SageColors.textMuted,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  formError: {
    color: SageColors.danger,
    fontSize: 14,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SageColors.primary,
    marginBottom: Spacing.sm,
  },
  successDescription: {
    fontSize: 14,
    color: SageColors.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    color: SageColors.textMuted,
    fontSize: 15,
  },
  link: {
    color: SageColors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
