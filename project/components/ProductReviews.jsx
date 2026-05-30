import { useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { StarPicker } from '@/components/StarPicker';
import { StarRating } from '@/components/StarRating';
import { useApp } from '@/context/AppContext';
import { appHref } from '@/lib/href';
import { SageColors, Spacing } from '@/constants/theme';

function formatReviewDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function ProductReviews({ productId, productName }) {
  const app = useApp();
  const user = app?.user;
  const getReviewsForProduct = app?.getReviewsForProduct;
  const getProductRating = app?.getProductRating;
  const addReview = app?.addReview;

  const pid = String(productId ?? '');
  const reviews = getReviewsForProduct ? getReviewsForProduct(pid) : [];
  const { rating, reviewCount } = getProductRating
    ? getProductRating(pid)
    : { rating: 0, reviewCount: 0 };

  const [ratingInput, setRatingInput] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to leave a review.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push(appHref('/(auth)/login')) },
      ]);
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Review required', 'Please write a few words about this product.');
      return;
    }

    setSubmitting(true);
    try {
      if (!addReview) {
        Alert.alert('Unavailable', 'Reviews are still loading. Please try again.');
        return;
      }
      const error = await addReview({
        productId: pid,
        rating: ratingInput,
        comment,
      });
      if (error) {
        Alert.alert('Could not post review', error);
        return;
      }
      setComment('');
      setRatingInput(5);
      Alert.alert('Thank you', 'Your review has been posted.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Customer Reviews</Text>
      <StarRating rating={rating} reviewCount={reviewCount} size={16} />

      {reviews.length === 0 ? (
        <Text style={styles.empty}>No reviews yet. Be the first to review {productName}.</Text>
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHead}>
              <Text style={styles.author}>{review.authorName}</Text>
              <Text style={styles.date}>{formatReviewDate(review.createdAt)}</Text>
            </View>
            <StarRating rating={review.rating} size={12} />
            <Text style={styles.comment}>{review.comment}</Text>
          </View>
        ))
      )}

      <View style={styles.form}>
        <Text style={styles.formTitle}>Write a review</Text>
        {!user ? (
          <Text style={styles.signInHint}>Sign in to share your experience with this product.</Text>
        ) : null}
        <Text style={styles.label}>Your rating</Text>
        <StarPicker value={ratingInput} onChange={setRatingInput} />
        <AppInput
          label="Your review"
          value={comment}
          onChangeText={setComment}
          placeholder="What did you like about this product?"
          multiline
          numberOfLines={4}
          style={styles.commentInput}
        />
        <AppButton
          title={user ? 'Post Review' : 'Sign in to Review'}
          onPress={handleSubmit}
          loading={submitting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: SageColors.text,
    marginBottom: Spacing.xs,
  },
  empty: {
    fontSize: 14,
    color: SageColors.textMuted,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  reviewCard: {
    backgroundColor: SageColors.sageLight,
    borderRadius: 12,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  reviewHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    fontWeight: '700',
    color: SageColors.text,
  },
  date: {
    fontSize: 11,
    color: SageColors.textMuted,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    color: SageColors.text,
    marginTop: 6,
  },
  form: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SageColors.text,
  },
  signInHint: {
    fontSize: 13,
    color: SageColors.textMuted,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: SageColors.textMuted,
    marginTop: Spacing.xs,
  },
  commentInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
