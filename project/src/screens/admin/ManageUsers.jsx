import { Alert, FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/GlassCard';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useApp } from '@/context/AppContext';
import { SageColors, Spacing } from '@/constants/theme';

export default function ManageUsers() {
  const { users, deleteUser } = useApp();
  const customers = users.filter((u) => u.role === 'customer');

  const handleDelete = (item) => {
    Alert.alert('Delete User', `Are you sure you want to delete ${item.name}'s account? This action is permanent.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser(item.id);
            Alert.alert('Success', 'User account successfully deleted.');
          } catch (error) {
            console.error('Delete user failed:', error);
            Alert.alert('Error', 'Failed to delete user account. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenBackground nested>
      <FlatList
        data={customers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.screenHint}>
            Registered customers list. Tap the trash icon to permanently remove an account.
          </Text>
        }
        ListEmptyComponent={<Text style={styles.empty}>No registered customers found.</Text>}
        renderItem={({ item }) => (
          <GlassCard style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            {item.phone ? <Text style={styles.meta}>Phone: {item.phone}</Text> : null}
            {item.address ? <Text style={styles.meta}>Address: {item.address}</Text> : null}
            <Pressable
              style={styles.delete}
              onPress={() => handleDelete(item)}>
              <Ionicons name="trash-outline" size={22} color={SageColors.danger} />
            </Pressable>
          </GlassCard>
        )}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing.md,
    paddingTop: 100,
    paddingBottom: 100,
  },
  screenHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  card: {
    marginBottom: Spacing.sm,
    paddingRight: 48, // space for the delete button
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: SageColors.text,
  },
  email: {
    fontSize: 14,
    color: SageColors.textMuted,
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    color: SageColors.textMuted,
    marginTop: 2,
  },
  delete: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  empty: {
    textAlign: 'center',
    color: SageColors.white,
    marginTop: 40,
  },
});
