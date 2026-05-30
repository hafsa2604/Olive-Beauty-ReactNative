import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, Pressable, View, Image, ActivityIndicator, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { GlassCard } from '@/components/GlassCard';
import { KeyboardAwareForm } from '@/components/KeyboardAwareForm';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useApp } from '@/context/AppContext';
import { SageColors, Spacing } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/types';
import { uploadProductImage } from '@/src/services/productService';
import { resolveImage } from '@/constants/images';

const CATEGORIES = ['skincare', 'haircare'];

export default function ProductForm() {
  const { id } = useLocalSearchParams();
  const { getProduct, addProduct, updateProduct } = useApp();
  
  const existing = useMemo(() => (id ? getProduct(id) : undefined), [id, getProduct]);

  // Complete field states
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [category, setCategory] = useState(existing?.category ?? 'skincare');
  const [skinType, setSkinType] = useState(existing?.skinType ?? 'Suitable for all skin types');
  const [hairType, setHairType] = useState(existing?.hairType ?? 'Suitable for all hair types');
  const [ingredients, setIngredients] = useState(existing?.ingredients ?? '');
  const [usageInstructions, setUsageInstructions] = useState(existing?.usageInstructions ?? '');
  const [rating, setRating] = useState(existing ? String(existing.rating) : '4.5');
  const [stock, setStock] = useState(existing ? String(existing.stock) : '50');
  const [image, setImage] = useState(existing?.image ?? '');
  
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Pick an image from gallery
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload product photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Square ratio works best for premium e-commerce catalogs
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picking error:', error);
      Alert.alert('Error', 'Failed to open image gallery.');
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !price || !stock) {
      Alert.alert('Missing Fields', 'Name, description, price, and stock are required.');
      return;
    }

    const priceNum = parseFloat(price);
    const ratingNum = parseFloat(rating);
    const stockNum = parseInt(stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price greater than 0.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Invalid Stock', 'Please enter a valid stock count.');
      return;
    }

    setSaving(true);
    let finalImageUrl = image;

    try {
      // If a local image was picked, upload it to Firebase Storage first
      if (selectedImageUri) {
        setUploadingImage(true);
        console.log('Uploading new image to Firebase Storage...');
        finalImageUrl = await uploadProductImage(selectedImageUri);
        setUploadingImage(false);
      }

      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        skinType: skinType.trim(),
        hairType: hairType.trim(),
        ingredients: ingredients.trim() || 'Natural ingredients',
        usageInstructions: usageInstructions.trim() || 'Apply as directed.',
        rating: isNaN(ratingNum) ? 4.5 : Math.min(5, Math.max(0, ratingNum)),
        stock: stockNum,
        image: finalImageUrl || 'glow cleanser.jpeg', // fallback if empty
      };

      if (existing) {
        await updateProduct(existing.id, payload);
        Alert.alert('Success', 'Product updated successfully in Firestore!');
      } else {
        await addProduct(payload);
        Alert.alert('Success', 'Product created successfully in Firestore!');
      }
      router.back();
    } catch (error) {
      console.error('Save product failed:', error);
      Alert.alert('Save Failed', 'Failed to save product in Firebase: ' + error.message);
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  };

  const displayedImage = useMemo(() => {
    if (selectedImageUri) return { uri: selectedImageUri };
    if (image) return resolveImage(image);
    return null;
  }, [selectedImageUri, image]);

  return (
    <ScreenBackground nested>
      <KeyboardAwareForm nested extraBottomPadding={56} contentContainerStyle={styles.scroll}>
        <GlassCard>
          <Text style={styles.title}>{existing ? 'Edit Product' : 'Add Product'}</Text>
          
          {/* Image Upload Area */}
          <Text style={styles.label}>Product Image</Text>
          <Pressable style={styles.imageSelector} onPress={handlePickImage}>
            {displayedImage ? (
              <Image source={displayedImage} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>Tap to select product image</Text>
              </View>
            )}
          </Pressable>

          <AppInput label="Product Name" value={name} onChangeText={setName} placeholder="e.g. Lavender Hydrosol Serum" />
          
          <AppInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.multiline}
            placeholder="Introduce the benefits and textures..."
          />
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <AppInput label="Price ($)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="29.99" />
            </View>
            <View style={styles.halfInput}>
              <AppInput label="Stock Qty" value={stock} onChangeText={setStock} keyboardType="number-pad" placeholder="50" />
            </View>
          </View>

          <AppInput label="Ingredients" value={ingredients} onChangeText={setIngredients} multiline placeholder="List key ingredients separated by commas..." />
          <AppInput label="Usage Instructions" value={usageInstructions} onChangeText={setUsageInstructions} multiline placeholder="How and when should this be applied?" />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <AppInput label="Rating (0-5)" value={rating} onChangeText={setRating} keyboardType="decimal-pad" placeholder="4.8" />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.selectLabel}>Category</Text>
              <View style={styles.categories}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[styles.catBtn, category === cat && styles.catBtnActive]}
                    onPress={() => setCategory(cat)}>
                    <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <AppInput label="Suitable Skin Type" value={skinType} onChangeText={setSkinType} placeholder="e.g. Dry, Oily, Normal, Sensitive" />
          <AppInput label="Suitable Hair Type" value={hairType} onChangeText={setHairType} placeholder="e.g. Frizzy, Fine, Thinning, Color-treated" />

          {saving && (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="small" color={SageColors.primary} />
              <Text style={styles.loaderText}>
                {uploadingImage ? 'Uploading image to Firebase Storage...' : 'Saving to Firestore database...'}
              </Text>
            </View>
          )}

          <AppButton
            title={existing ? 'Update Product' : 'Add Product'}
            onPress={handleSave}
            disabled={saving}
          />
        </GlassCard>
      </KeyboardAwareForm>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingTop: 100,
    paddingBottom: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: SageColors.text,
    marginBottom: Spacing.md,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: SageColors.text,
    marginBottom: Spacing.xs,
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SageColors.text,
    marginBottom: 6,
  },
  imageSelector: {
    height: 160,
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: SageColors.cardBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  placeholderText: {
    color: SageColors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  halfInput: {
    flex: 1,
  },
  categories: {
    flexDirection: 'row',
    gap: 8,
  },
  catBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
    backgroundColor: SageColors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBtnActive: {
    backgroundColor: SageColors.primary,
    borderColor: SageColors.primary,
  },
  catText: {
    fontSize: 13,
    fontWeight: '600',
    color: SageColors.text,
  },
  catTextActive: {
    color: SageColors.white,
  },
  loaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  loaderText: {
    fontSize: 13,
    color: SageColors.textMuted,
  },
});
