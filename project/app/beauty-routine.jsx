import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { GlassCard } from '@/components/GlassCard';
import { MatchaScreen } from '@/components/MatchaScreen';
import { useApp } from '@/context/AppContext';
import { SageColors, Radius, Spacing, Shadows } from '@/constants/theme';

const EXPERT_ROUTINES = [
  {
    id: 'exp-1',
    name: 'Morning Glow',
    label: 'Morning',
    skinType: 'Suitable for dry and combination skin',
    steps: 'Cleanser → Serum → SPF',
    recommended: ['Glow Cleanser', 'Vitamin C Serum', 'Sunveil SPF'],
    icon: 'sunny-outline',
  },
  {
    id: 'exp-2',
    name: 'Night Repair',
    label: 'Night',
    skinType: 'Suitable for dry and combination skin',
    steps: 'Double Cleanse → Night Cream',
    recommended: ['Pure Foam Cleanser', 'Overnight Cream'],
    icon: 'moon-outline',
  },
  {
    id: 'exp-3',
    name: 'Oily Skin Clarifier',
    label: 'Morning & Night',
    skinType: 'Suitable for oily skin',
    steps: 'Oil Control Cleanser → Sebum Serum → Gel Cream',
    recommended: ['Oil Control Gel Cleanser', 'Niacinamide Oil Control Serum', 'Matcha Dew Cream'],
    icon: 'water-outline',
  },
  {
    id: 'exp-4',
    name: 'Soothing Sensitive Ritual',
    label: 'Night',
    skinType: 'Suitable for sensitive skin',
    steps: 'Calm Cleanser → Repair Serum → Barrier Cream',
    recommended: ['Calm Skin Gentle Cleanser', 'Ceramide Repair Boost Serum', 'Cloud Barrier Cream'],
    icon: 'leaf-outline',
  },
];

export default function BeautyRoutineScreen() {
  const { routines, addRoutine, deleteRoutine } = useApp();
  const [activeTab, setActiveTab] = useState('expert'); // 'expert' or 'custom'
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineSteps, setNewRoutineSteps] = useState('');
  const [newRoutineSkin, setNewRoutineSkin] = useState('');
  const [newRoutineTime, setNewRoutineTime] = useState('Morning'); // Morning, Night, Morning & Night

  const handleCreateRoutine = () => {
    if (!newRoutineName.trim()) {
      Alert.alert('Error', 'Please enter a routine name.');
      return;
    }
    if (!newRoutineSteps.trim()) {
      Alert.alert('Error', 'Please enter steps (e.g. Cleanser → Serum).');
      return;
    }
    const skinInfo = newRoutineSkin.trim() ? `Suitable for ${newRoutineSkin.trim()}` : 'Suitable for all skin types';
    const finalSteps = `${newRoutineSteps.trim()} (${newRoutineTime})`;
    
    addRoutine(newRoutineName, `${skinInfo} | ${finalSteps}`);
    setNewRoutineName('');
    setNewRoutineSteps('');
    setNewRoutineSkin('');
    setNewRoutineTime('Morning');
    setShowAddForm(false);
    Alert.alert('Success', 'Your custom routine has been saved!');
  };

  const handleDeleteRoutine = (id, name) => {
    Alert.alert('Delete Routine', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteRoutine(id),
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Beauty Routines', headerShown: true }} />
      <MatchaScreen edges={false}>
        <View style={styles.container}>
          {/* Segmented Tab Bar */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, activeTab === 'expert' && styles.activeTab]}
              onPress={() => setActiveTab('expert')}>
              <Text style={[styles.tabText, activeTab === 'expert' && styles.activeTabText]}>
                Expert Formulas
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'custom' && styles.activeTab]}
              onPress={() => setActiveTab('custom')}>
              <Text style={[styles.tabText, activeTab === 'custom' && styles.activeTabText]}>
                My Custom Routines
              </Text>
            </Pressable>
          </View>

          {activeTab === 'expert' ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              <Text style={styles.subtext}>
                Expertly designed skin formulas optimized for your daily ritual.
              </Text>

              {EXPERT_ROUTINES.map((item) => (
                <GlassCard key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <Ionicons name={item.icon} size={20} color={SageColors.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.routineName}>{item.name}</Text>
                    </View>
                    <View style={[styles.labelBadge, item.label === 'Morning' ? styles.dayBadge : styles.nightBadge]}>
                      <Text style={styles.badgeText}>{item.label}</Text>
                    </View>
                  </View>

                  <View style={styles.skinTypeRow}>
                    <Ionicons name="sparkles-outline" size={14} color={SageColors.textMuted} />
                    <Text style={styles.skinText}>{item.skinType}</Text>
                  </View>

                  <View style={styles.stepsBox}>
                    <Text style={styles.sectionLabel}>Routine Steps</Text>
                    <Text style={styles.stepsText}>{item.steps}</Text>
                  </View>

                  <View style={styles.productsBox}>
                    <Text style={styles.sectionLabel}>Recommended Products</Text>
                    <View style={styles.productsGrid}>
                      {item.recommended.map((prod, idx) => (
                        <View key={idx} style={styles.productPill}>
                          <Ionicons name="checkmark" size={12} color={SageColors.white} />
                          <Text style={styles.pillText}>{prod}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </GlassCard>
              ))}
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              <View style={styles.customHeader}>
                <Text style={styles.subtext}>
                  Create your own skincare configurations tailored for your specific goals.
                </Text>
                {!showAddForm && (
                  <AppButton
                    title="Add Custom Routine"
                    variant="outline"
                    onPress={() => setShowAddForm(true)}
                    style={styles.addBtn}
                  />
                )}
              </View>

              {showAddForm && (
                <GlassCard style={styles.formCard}>
                  <Text style={styles.formTitle}>Create Custom Routine</Text>
                  <AppInput
                    label="Routine Name"
                    placeholder="e.g. Sensitive Skin Hydrator"
                    value={newRoutineName}
                    onChangeText={setNewRoutineName}
                  />
                  <AppInput
                    label="Suitable Skin Type"
                    placeholder="e.g. Sensitive Skin (Optional)"
                    value={newRoutineSkin}
                    onChangeText={setNewRoutineSkin}
                  />
                  <AppInput
                    label="Routine Steps"
                    placeholder="e.g. Calm Cleanser → Repair Serum → Barrier Cream"
                    value={newRoutineSteps}
                    onChangeText={setNewRoutineSteps}
                  />

                  <Text style={styles.formLabel}>Routine Frequency</Text>
                  <View style={styles.timeRow}>
                    {['Morning', 'Night', 'Morning & Night'].map((time) => (
                      <Pressable
                        key={time}
                        style={[styles.timeOption, newRoutineTime === time && styles.timeOptionActive]}
                        onPress={() => setNewRoutineTime(time)}>
                        <Text style={[styles.timeText, newRoutineTime === time && styles.timeTextActive]}>
                          {time}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <View style={styles.formBtns}>
                    <AppButton
                      title="Save Routine"
                      onPress={handleCreateRoutine}
                      style={{ flex: 1.2, minHeight: 40, paddingVertical: 10 }}
                    />
                    <AppButton
                      title="Cancel"
                      variant="outline"
                      onPress={() => setShowAddForm(false)}
                      style={{ flex: 1, minHeight: 40, paddingVertical: 10 }}
                    />
                  </View>
                </GlassCard>
              )}

              {routines.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="sparkles" size={32} color={SageColors.accent} />
                  <Text style={styles.emptyText}>No custom routines configured yet.</Text>
                </View>
              ) : (
                routines.map((r) => {
                  // Parse skin info and steps if they were formatted
                  const parts = r.steps.split('|');
                  const skinInfo = parts[0]?.trim() || 'Suitable for all skin types';
                  const stepDetail = parts[1]?.trim() || parts[0]?.trim();

                  return (
                    <GlassCard key={r.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                          <Ionicons name="sparkles-outline" size={20} color={SageColors.primary} style={{ marginRight: 6 }} />
                          <Text style={styles.routineName}>{r.name}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDeleteRoutine(r.id, r.name)}>
                          <Ionicons name="trash-outline" size={16} color={SageColors.danger} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.skinTypeRow}>
                        <Ionicons name="person-outline" size={14} color={SageColors.textMuted} />
                        <Text style={styles.skinText}>{skinInfo}</Text>
                      </View>

                      <View style={styles.stepsBox}>
                        <Text style={styles.sectionLabel}>Steps</Text>
                        <Text style={styles.stepsText}>{stepDetail}</Text>
                      </View>
                    </GlassCard>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      </MatchaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: SageColors.white,
    padding: Spacing.xs,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  activeTab: {
    backgroundColor: SageColors.sageLight,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: SageColors.textMuted,
  },
  activeTabText: {
    color: SageColors.primaryDark,
  },
  scroll: {
    padding: Spacing.md,
    paddingBottom: 60,
  },
  subtext: {
    fontSize: 13,
    color: SageColors.textMuted,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(122, 155, 118, 0.12)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.8,
  },
  routineName: {
    fontSize: 16,
    fontWeight: '750',
    color: SageColors.text,
  },
  labelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm - 4,
  },
  dayBadge: {
    backgroundColor: '#FAF7EE',
    borderWidth: 1,
    borderColor: '#EFE2B9',
  },
  nightBadge: {
    backgroundColor: '#F3F4FB',
    borderWidth: 1,
    borderColor: '#D7DAF4',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: SageColors.primaryDark,
  },
  skinTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  skinText: {
    fontSize: 12,
    color: SageColors.textMuted,
    fontWeight: '550',
  },
  stepsBox: {
    backgroundColor: '#FAFBF9',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(122, 155, 118, 0.08)',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: SageColors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  stepsText: {
    fontSize: 13,
    color: SageColors.text,
    fontWeight: '600',
    lineHeight: 18,
  },
  productsBox: {
    marginTop: 4,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  productPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SageColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 4,
  },
  pillText: {
    color: SageColors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  customHeader: {
    flexDirection: 'column',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  addBtn: {
    minHeight: 40,
    paddingVertical: 10,
    marginTop: 4,
  },
  formCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: SageColors.primary,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '750',
    color: SageColors.primaryDark,
    marginBottom: Spacing.md,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SageColors.text,
    marginBottom: Spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  timeOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.sm,
    backgroundColor: SageColors.white,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
  },
  timeOptionActive: {
    backgroundColor: SageColors.primary,
    borderColor: SageColors.primary,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: SageColors.text,
  },
  timeTextActive: {
    color: SageColors.white,
  },
  formBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: '#FDF2F2',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: Spacing.xs,
  },
  emptyText: {
    color: SageColors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
