import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { Tour } from '@natours/shared';
import { colors } from '../theme';

interface Props {
  tour: Tour;
  onPress: () => void;
}

export function TourCard({ tour, onPress }: Props) {
  // The cover may be either a Cloudinary/ImageKit URL (new) or just a filename
  // (legacy seed data) — show a placeholder if it's not an absolute URL yet.
  const coverUrl = /^https?:\/\//i.test(tour.imageCover) ? tour.imageCover : null;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {coverUrl ? (
        <Image
          source={coverUrl}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {tour.name}
        </Text>
        <Text style={styles.summary} numberOfLines={2}>
          {tour.summary}
        </Text>
        <View style={styles.row}>
          <Text style={styles.price}>${tour.price}</Text>
          <Text style={styles.meta}>
            {tour.duration} days · {tour.difficulty}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: { width: '100%', height: 180, backgroundColor: '#eee' },
  placeholder: { backgroundColor: colors.brandLight, opacity: 0.3 },
  body: { padding: 14 },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
  },
  summary: { color: colors.textMuted, fontSize: 13, marginBottom: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { fontSize: 16, fontWeight: '700', color: colors.brandDark },
  meta: { color: colors.textMuted, fontSize: 12 },
});
