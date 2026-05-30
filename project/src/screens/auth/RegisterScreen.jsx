import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { GlassCard } from '@/components/GlassCard';
import { KeyboardAwareForm } from '@/components/KeyboardAwareForm';
import { MatchaScreen } from '@/components/MatchaScreen';
import { useApp } from '@/context/AppContext';
import { APP_NAME, SageColors, Spacing } from '@/constants/theme';
import { showAlert } from '@/lib/feedback';
import { appHref } from '@/lib/href';

export default function RegisterScreen() {
  const { register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleRegister = async () => {
    Keyboard.dismiss();
    setFormError(null);

    if (!name.trim() || !email.trim() || !password || !confirm) {
      const message = 'Please fill in all fields.';
      setFormError(message);
      showAlert('Missing fields', message);
      return;
    }
    if (password.length < 6) {
      const message = 'Password must be at least 6 characters.';
      setFormError(message);
      showAlert('Weak password', message);
      return;
    }
    if (password !== confirm) {
      const message = 'Passwords do not match.';
      setFormError(message);
      showAlert('Password mismatch', message);
      return;
    }

    setLoading(true);
    try {
      const error = await register(name, email, password);
      if (error) {
        setFormError(error);
        showAlert('Registration failed', error);
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
      <KeyboardAwareForm contentContainerStyle={styles.scroll} extraBottomPadding={48}>
          <Text style={styles.brand}>Join {APP_NAME}</Text>

          <GlassCard>
            <AppInput label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
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
              placeholder="Min. 6 characters"
            />
            <AppInput
              label="Confirm Password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholder="Repeat password"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <AppButton title="Create Account" onPress={handleRegister} loading={loading} />
          </GlassCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
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
    padding: Spacing.lg,
    paddingTop: 60,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: SageColors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
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
