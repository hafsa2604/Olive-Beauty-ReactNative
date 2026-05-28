import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { GlassCard } from '@/components/GlassCard';
import { MatchaScreen } from '@/components/MatchaScreen';
import { useApp } from '@/context/AppContext';
import { SageColors, Radius, Spacing, Shadows } from '@/constants/theme';
import { appHref } from '@/lib/href';

const EXPERT_ROUTINES = [
  {
    id: 'exp-1',
    name: 'Morning Glow Ritual',
    label: 'Morning',
    skinType: 'Suitable for dry skin',
    rawSkinType: 'dry',
    steps: 'Gentle Cleanser → Hydrating Serum → Vitamin C → Day Moisturizer → SPF',
    recommended: ['Glow Cleanser', 'Vitamin C Serum', 'Sunveil SPF', 'Glow Protect Day Cream'],
    concern: 'Dullness & Hydration',
    ingredients: 'Hyaluronic Acid, Vitamin C, Squalane',
    icon: 'sunny-outline',
  },
  {
    id: 'exp-2',
    name: 'Overnight Barrier Renewal',
    label: 'Night',
    skinType: 'Suitable for dry and sensitive skin',
    rawSkinType: 'sensitive',
    steps: 'Double Cleanse → Barrier Repair Cleanser → Overnight Moisture Cream',
    recommended: ['Barrier Repair Cleanser', 'Overnight Cream', 'Overnight Barrier Repair Cream'],
    concern: 'Redness & Weak Skin Barrier',
    ingredients: 'Ceramides, Peptides, Oatmeal',
    icon: 'moon-outline',
  },
  {
    id: 'exp-3',
    name: 'Oily Skin Balancing Ritual',
    label: 'Morning & Night',
    skinType: 'Suitable for oily skin',
    rawSkinType: 'oily',
    steps: 'Oil Control Cleanser → Niacinamide Serum → Matcha Dew Gel Cream',
    recommended: ['Oil Control Gel Cleanser', 'Niacinamide Oil Control Serum', 'Matcha Dew Cream'],
    concern: 'Excess Sebum & Large Pores',
    ingredients: 'Salicylic Acid, Niacinamide, Zinc PCA',
    icon: 'water-outline',
  },
  {
    id: 'exp-4',
    name: 'Sensitized Redness Reliever',
    label: 'Night',
    skinType: 'Suitable for sensitive skin',
    rawSkinType: 'sensitive',
    steps: 'Calming Cleanser → Ceramide Recovery Serum → Cloud Barrier Moisturizer',
    recommended: ['Calm Skin Gentle Cleanser', 'Ceramide Repair Boost Serum', 'Cloud Barrier Cream'],
    concern: 'Acne Flushes & Irritated Skin',
    ingredients: 'Centella Asiatica, Allantoin, Aloe Vera',
    icon: 'leaf-outline',
  },
  {
    id: 'exp-5',
    name: 'Active Acne Clearing Protocol',
    label: 'Morning & Night',
    skinType: 'Suitable for combination skin',
    rawSkinType: 'combination',
    steps: 'Salicylic Cleanser → Tea Tree Spot Serum → SPF 30 Hydrating Gel',
    recommended: ['Salicylic Acid Acne Cleanser', 'Tea Tree Healing Spot Serum', 'SPF 30 Hydrating Cream'],
    concern: 'Active Breakouts & Acne Flares',
    ingredients: '2% Salicylic Acid, Tea Tree, Niacinamide',
    icon: 'checkmark-circle-outline',
  },
];

export default function BeautyRoutineScreen() {
  const { routines, addRoutine, deleteRoutine, products } = useApp();
  const [activeTab, setActiveTab] = useState('expert'); // 'expert' or 'custom'
  const [selectedSkinFilter, setSelectedSkinFilter] = useState('all'); // all, oily, dry, sensitive, combination
  const [expandedAdvisor, setExpandedAdvisor] = useState(false);

  // New Routine Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineSteps, setNewRoutineSteps] = useState('');
  const [newRoutineSkin, setNewRoutineSkin] = useState('all'); // all, oily, dry, sensitive, combination
  const [newRoutineTime, setNewRoutineTime] = useState('Morning'); // Morning, Night, Morning & Night

  // Safe Haptic feedback helper
  const triggerHaptic = useCallback(async (type = 'success') => {
    try {
      if (type === 'success') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'medium') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (e) {
      console.log('Haptics not supported:', e.message);
    }
  }, []);

  // Add Custom Routine
  const handleCreateRoutine = () => {
    if (!newRoutineName.trim()) {
      Alert.alert('Error', 'Please enter a routine name.');
      return;
    }
    if (!newRoutineSteps.trim()) {
      Alert.alert('Error', 'Please enter steps (e.g. Cleanser → Serum).');
      return;
    }
    
    // Parse values to match parsing patterns in rendering
    const skinFormatted = `Suitable for ${newRoutineSkin} skin`;
    const finalSteps = `${skinFormatted} | ${newRoutineSteps.trim()} (${newRoutineTime})`;
    
    addRoutine(newRoutineName, finalSteps);
    setNewRoutineName('');
    setNewRoutineSteps('');
    setNewRoutineSkin('all');
    setNewRoutineTime('Morning');
    setShowAddForm(false);
    triggerHaptic('success');
    Alert.alert('Success', 'Your custom routine has been saved!');
  };

  // Delete Custom Routine
  const handleDeleteRoutine = (id, name) => {
    Alert.alert('Delete Routine', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          deleteRoutine(id);
          await triggerHaptic('medium');
        },
      },
    ]);
  };

  // Dynamically match text-based recommended products with catalog products
  const renderMatchedProducts = (recNames) => {
    const matched = recNames
      .map((name) => products.find((p) => p.name.toLowerCase().includes(name.toLowerCase())))
      .filter((p) => p !== undefined);

    if (matched.length === 0) return null;

    return (
      <View style={styles.productsBox}>
        <Text style={styles.sectionLabel}>Matched Skincare (Tap to View Details)</Text>
        <View style={styles.productsGrid}>
          {matched.map((prod) => (
            <Pressable
              key={prod.id}
              style={[styles.productBadge, Shadows.soft]}
              onPress={() => {
                triggerHaptic('medium');
                router.push(appHref(`/product/${prod.id}`));
              }}>
              <Ionicons name="sparkles" size={11} color={SageColors.white} />
              <View style={styles.badgeContent}>
                <Text style={styles.badgeName} numberOfLines={1}>{prod.name}</Text>
                <Text style={styles.badgePrice}>${prod.price.toFixed(2)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  // Filter routines based on selected skin filter
  const filteredExpertRoutines = EXPERT_ROUTINES.filter((item) => {
    if (selectedSkinFilter === 'all') return true;
    return item.skinType.toLowerCase().includes(selectedSkinFilter) || item.rawSkinType === selectedSkinFilter;
  });

  const filteredCustomRoutines = routines.filter((r) => {
    if (selectedSkinFilter === 'all') return true;
    // custom routines store steps inside "Suitable for <type> skin | Steps details"
    const parts = r.steps.split('|');
    const skinInfo = parts[0]?.trim() || '';
    return skinInfo.toLowerCase().includes(selectedSkinFilter);
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Skincare Solutions', headerShown: true }} />
      <MatchaScreen edges={false}>
        <View style={styles.container}>
          
          {/* Collapsible Skincare Ingredient & Skin Type Education Advisor */}
          <GlassCard style={styles.advisorCard}>
            <TouchableOpacity
              style={styles.advisorHeader}
              onPress={() => {
                triggerHaptic('medium');
                setExpandedAdvisor(!expandedAdvisor);
              }}>
              <View style={styles.advisorHeaderLeft}>
                <Ionicons name="bulb-outline" size={20} color={SageColors.accent} />
                <Text style={styles.advisorTitle}>🔍 Skin Type & Active Ingredient Advisor</Text>
              </View>
              <Ionicons
                name={expandedAdvisor ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={18}
                color={SageColors.text}
              />
            </TouchableOpacity>

            {expandedAdvisor && (
              <View style={styles.advisorExpanded}>
                <View style={styles.divider} />
                <View style={styles.advisorRow}>
                  <Text style={styles.advisorLabel}>Dry Skin:</Text>
                  <Text style={styles.advisorDetail}>Needs deep hydration. Best actives: **Ceramides, Squalane, Hyaluronic Acid**. Avoid denatured alcohols.</Text>
                </View>
                <View style={styles.advisorRow}>
                  <Text style={styles.advisorLabel}>Oily Skin:</Text>
                  <Text style={styles.advisorDetail}>Needs sebum regulation. Best actives: **Niacinamide, Salicylic Acid (BHA), Tea Tree**. Opt for light gel formulations.</Text>
                </View>
                <View style={styles.advisorRow}>
                  <Text style={styles.advisorLabel}>Sensitive Skin:</Text>
                  <Text style={styles.advisorDetail}>Needs skin barrier protection. Best actives: **Centella Asiatica (Cica), Panthenol, Aloe Vera**. Avoid synthetic perfumes.</Text>
                </View>
                <View style={styles.advisorRow}>
                  <Text style={styles.advisorLabel}>Combination:</Text>
                  <Text style={styles.advisorDetail}>Needs balance. Target T-zone with balancing actives and dry zones with rich moisturizers.</Text>
                </View>
              </View>
            )}
          </GlassCard>

          {/* Skin Type Filter selector chips */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Targeted Skin Filter:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
              {['all', 'dry', 'oily', 'sensitive', 'combination'].map((filter) => (
                <Pressable
                  key={filter}
                  style={[styles.filterChip, selectedSkinFilter === filter && styles.filterChipActive]}
                  onPress={() => {
                    triggerHaptic('medium');
                    setSelectedSkinFilter(filter);
                  }}>
                  <Text style={[styles.filterChipText, selectedSkinFilter === filter && styles.filterChipTextActive]}>
                    {filter.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Segmented Tab Bar */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, activeTab === 'expert' && styles.activeTab]}
              onPress={() => {
                triggerHaptic('medium');
                setActiveTab('expert');
              }}>
              <Text style={[styles.tabText, activeTab === 'expert' && styles.activeTabText]}>
                Expert Solutions
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'custom' && styles.activeTab]}
              onPress={() => {
                triggerHaptic('medium');
                setActiveTab('custom');
              }}>
              <Text style={[styles.tabText, activeTab === 'custom' && styles.activeTabText]}>
                Custom Routine Builder
              </Text>
            </Pressable>
          </View>

          {activeTab === 'expert' ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              <Text style={styles.subtext}>
                Formulated by skin experts to target real skin concerns. Select a concern to view products.
              </Text>

              {filteredExpertRoutines.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="funnel-outline" size={32} color={SageColors.textMuted} />
                  <Text style={styles.emptyText}>No routines match this skin filter.</Text>
                </View>
              ) : (
                filteredExpertRoutines.map((item) => {
                  return (
                    <GlassCard key={item.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                          <Ionicons name={item.icon} size={20} color={SageColors.primary} style={{ marginRight: 6 }} />
                          <Text style={styles.routineName}>{item.name}</Text>
                        </View>
                        <View style={[styles.labelBadge, item.label.includes('Morning') ? styles.dayBadge : styles.nightBadge]}>
                          <Text style={styles.badgeText}>{item.label}</Text>
                        </View>
                      </View>

                      {/* Concern & Active Ingredients badges */}
                      <View style={styles.metaRow}>
                        <View style={styles.metaBadge}>
                          <Text style={styles.metaBadgeText}>Concern: {item.concern}</Text>
                        </View>
                        <View style={[styles.metaBadge, styles.ingredientBadge]}>
                          <Text style={[styles.metaBadgeText, styles.ingredientBadgeText]}>Actives: {item.ingredients}</Text>
                        </View>
                      </View>

                      <View style={styles.skinTypeRow}>
                        <Ionicons name="sparkles-outline" size={14} color={SageColors.textMuted} />
                        <Text style={styles.skinText}>{item.skinType}</Text>
                      </View>

                      <View style={styles.stepsBox}>
                        <Text style={styles.sectionLabel}>Optimal Absorbtion Order</Text>
                        <Text style={styles.stepsText}>{item.steps}</Text>
                      </View>

                      {/* Dynamic product links */}
                      {renderMatchedProducts(item.recommended)}
                    </GlassCard>
                  );
                })
              )}
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
                    onPress={() => {
                      triggerHaptic('medium');
                      setShowAddForm(true);
                    }}
                    style={styles.addBtn}
                  />
                )}
              </View>

              {showAddForm && (
                <GlassCard style={styles.formCard}>
                  <Text style={styles.formTitle}>Skincare Routine Builder</Text>
                  
                  <AppInput
                    label="Routine Name"
                    placeholder="e.g. Sensitive Skin Hydrator"
                    value={newRoutineName}
                    onChangeText={setNewRoutineName}
                  />
                  
                  <Text style={styles.formLabel}>Target Skin Type</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.formSkinTypes}>
                    {['dry', 'oily', 'sensitive', 'combination', 'all'].map((type) => (
                      <Pressable
                        key={type}
                        style={[styles.skinTypeOption, newRoutineSkin === type && styles.skinTypeOptionActive]}
                        onPress={() => {
                          triggerHaptic('medium');
                          setNewRoutineSkin(type);
                        }}>
                        <Text style={[styles.skinTypeText, newRoutineSkin === type && styles.skinTypeTextActive]}>
                          {type.toUpperCase()}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  
                  <AppInput
                    label="Routine Steps (in order of application)"
                    placeholder="e.g. Pure Foam Cleanser → Niacinamide Serum → Cream"
                    value={newRoutineSteps}
                    onChangeText={setNewRoutineSteps}
                  />

                  <Text style={styles.formLabel}>Routine Frequency</Text>
                  <View style={styles.timeRow}>
                    {['Morning', 'Night', 'Morning & Night'].map((time) => (
                      <Pressable
                        key={time}
                        style={[styles.timeOption, newRoutineTime === time && styles.timeOptionActive]}
                        onPress={() => {
                          triggerHaptic('medium');
                          setNewRoutineTime(time);
                        }}>
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
                      onPress={() => {
                        triggerHaptic('medium');
                        setShowAddForm(false);
                      }}
                      style={{ flex: 1, minHeight: 40, paddingVertical: 10 }}
                    />
                  </View>
                </GlassCard>
              )}

              {filteredCustomRoutines.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="sparkles" size={32} color={SageColors.accent} />
                  <Text style={styles.emptyText}>No custom routines match this skin filter.</Text>
                </View>
              ) : (
                filteredCustomRoutines.map((r) => {
                  const parts = r.steps.split('|');
                  const skinInfo = parts[0]?.trim() || 'Suitable for all skin types';
                  const stepDetail = parts[1]?.trim() || parts[0]?.trim();
                  
                  // Extract simple product recommendation names for matching
                  const matchedNames = stepDetail.replace(/[\(\)]/g, '').split('→').map((n) => n.trim());

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

                      {/* Dynamic product links in custom routines */}
                      {renderMatchedProducts(matchedNames)}
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
  advisorCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: 'rgba(122, 155, 118, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  advisorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advisorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  advisorTitle: {
    fontSize: 13,
    fontWeight: '750',
    color: SageColors.primaryDark,
  },
  advisorExpanded: {
    marginTop: Spacing.sm,
    gap: Spacing.sm - 4,
  },
  advisorRow: {
    flexDirection: 'column',
    gap: 2,
  },
  advisorLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: SageColors.primaryDark,
  },
  advisorDetail: {
    fontSize: 11.5,
    color: SageColors.text,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(122, 155, 118, 0.1)',
    marginVertical: Spacing.xs,
  },
  filterSection: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: SageColors.textMuted,
    marginBottom: Spacing.xs - 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  filterChipsRow: {
    gap: 8,
    paddingRight: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: SageColors.white,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: SageColors.primary,
    borderColor: SageColors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: SageColors.text,
  },
  filterChipTextActive: {
    color: SageColors.white,
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
    fontSize: 15,
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  metaBadge: {
    backgroundColor: '#F3F6F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm - 4,
  },
  metaBadgeText: {
    fontSize: 10,
    fontWeight: '650',
    color: SageColors.primaryDark,
  },
  ingredientBadge: {
    backgroundColor: '#EEF6F8',
  },
  ingredientBadgeText: {
    color: '#3A8A9E',
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
    fontWeight: '750',
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
    marginBottom: Spacing.sm,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  productBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SageColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    gap: 6,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeName: {
    color: SageColors.white,
    fontSize: 11,
    fontWeight: '700',
    maxWidth: 120,
  },
  badgePrice: {
    color: '#D4EBE0',
    fontSize: 10,
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
  formSkinTypes: {
    gap: 6,
    marginBottom: Spacing.md,
    paddingRight: Spacing.md,
  },
  skinTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: SageColors.white,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
  },
  skinTypeOptionActive: {
    backgroundColor: SageColors.primary,
    borderColor: SageColors.primary,
  },
  skinTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: SageColors.text,
  },
  skinTypeTextActive: {
    color: SageColors.white,
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
