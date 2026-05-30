import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, StyleSheet } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { GlassCard } from '@/components/GlassCard';
import { KeyboardAwareForm } from '@/components/KeyboardAwareForm';
import { MatchaScreen } from '@/components/MatchaScreen';
import { useApp } from '@/context/AppContext';
import { Spacing } from '@/constants/theme';

export default function EditProfileScreen() {
  const { user, updateProfile } = useApp();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      Alert.alert('Saved', 'Your profile has been updated.');
      router.back();
    } catch (error) {
      console.error('Update profile failed:', error);
      Alert.alert('Update Failed', 'Failed to save profile. Please try again.');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Edit Profile',
        }}
      />
      <MatchaScreen edges={false}>
        <KeyboardAwareForm nested extraBottomPadding={48} contentContainerStyle={styles.scroll}>
          <GlassCard>
            <AppInput label="Full Name" value={name} onChangeText={setName} returnKeyType="next" />
            <AppInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+1 555-0199"
              returnKeyType="next"
            />
            <AppInput
              label="Default Address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              style={styles.addressInput}
              placeholder="Street, city, state, zip code"
            />
            <AppButton title="Save Changes" onPress={handleSave} />
          </GlassCard>
        </KeyboardAwareForm>
      </MatchaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingTop: 100,
  },
  addressInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
});
