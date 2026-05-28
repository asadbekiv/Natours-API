import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { Review, User } from '@natours/shared';
import { colors } from '../theme';

const CARD_WIDTH = 260;
const CARD_GAP = 10;

/**
 * Horizontal swipeable review carousel.
 * Compact cards (avatar + name + stars + 4 lines of text) with snap-to-card
 * scrolling — the next card peeks at the right edge so users know there's more.
 */
export function ReviewList({ reviews }: { reviews?: Review[] }) {
  if (!reviews?.length) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Reviews ({reviews.length})</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_GAP}
        snapToAlignment="start"
        contentContainerStyle={styles.track}
      >
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </ScrollView>
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const user = typeof review.user === 'object' ? (review.user as User) : null;
  const photoUrl =
    user?.photo && /^https?:\/\//i.test(user.photo) ? user.photo : null;
  const date = new Date(review.createdAt).toLocaleDateString();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {photoUrl ? (
          <Image source={photoUrl} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name ?? 'Anonymous'}
          </Text>
          <Text style={styles.stars}>
            {'★'.repeat(review.rating)}
            <Text style={styles.starsDim}>
              {'★'.repeat(5 - review.rating)}
            </Text>
          </Text>
        </View>
      </View>
      <Text style={styles.body} numberOfLines={4}>
        {review.review}
      </Text>
      <Text style={styles.date}>{date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 28 },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
  },
  // A bit of trailing space so the last card doesn't kiss the edge.
  track: { paddingRight: 16 },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    backgroundColor: colors.cardBg,
    padding: 12,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  avatarPlaceholder: {
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontWeight: '700', fontSize: 13 },
  name: { fontSize: 13, fontWeight: '600', color: colors.textDark },
  stars: {
    fontSize: 12,
    color: colors.star,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  starsDim: { color: '#e2e2e2' },
  // Fixed min-height so cards line up regardless of review length.
  body: {
    color: colors.textDark,
    lineHeight: 18,
    fontSize: 13,
    minHeight: 72,
  },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 8 },
});
