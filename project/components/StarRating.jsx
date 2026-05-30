import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { SageColors } from '@/constants/theme';

export function StarRating({ rating, reviewCount, size = 14 }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.row}>
      {stars.map((star) => (
        <Ionicons
          key={star}
          name={rating >= star - 0.25 ? 'star' : rating >= star - 0.75 ? 'star-half' : 'star-outline'}
          size={size}
          color="#E6B422"
        />
      ))}
      {reviewCount !== undefined ? (
        <Text style={styles.count}>({reviewCount})</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  count: {
    marginLeft: 4,
    fontSize: 12,
    color: SageColors.textMuted,
  },
});
