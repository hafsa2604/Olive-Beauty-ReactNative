import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View, Pressable } from 'react-native';

import { appHref } from '@/lib/href';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { GlassCard } from '@/components/GlassCard';
import { KeyboardAwareForm } from '@/components/KeyboardAwareForm';
import { MatchaScreen } from '@/components/MatchaScreen';
import { useApp } from '@/context/AppContext';
import { APP_NAME, SageColors, Spacing } from '@/constants/theme';
import { showAlert } from '@/lib/feedback';

export default function LoginScreen() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setFormError(null);

    if (!email.trim() || !password) {
      const message = 'Please enter your email and password.';
      setFormError(message);
      showAlert('Missing fields', message);
      return;
    }

    setLoading(true);
    try {
      const error = await login(email, password);
      if (error) {
        setFormError(error);
        showAlert('Login failed', error);
        return;
      }
      router.replace(appHref('/(tabs)/'));
    } catch {
      const message = 'Something went wrong. Please try again.';
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
          <Text style={styles.tagline}>Natural luxury · Self-care ritual</Text>

          <GlassCard style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@email.com"
            />
            <AppInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <View style={styles.forgotWrapper}>
              <Link href={appHref('/(auth)/forgot-password')} asChild>
                <Pressable>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              </Link>
            </View>

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <AppButton title="Sign In" onPress={handleLogin} loading={loading} />
          </GlassCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here? </Text>
            <Link href={appHref('/(auth)/register')} style={styles.link}>
              Create account
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
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: SageColors.text,
    marginBottom: Spacing.md,
  },
  forgotWrapper: {
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  forgotText: {
    fontSize: 13,
    color: SageColors.textMuted,
    fontWeight: '600',
  },
  formError: {
    color: SageColors.danger,
    fontSize: 14,
    marginBottom: Spacing.sm,
    textAlign: 'center',
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
