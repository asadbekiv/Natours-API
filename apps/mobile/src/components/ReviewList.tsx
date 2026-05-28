import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { Review, User } from '@natours/shared';
import { colors } from '../theme';

export function ReviewList({ reviews }: { reviews?: Review[] }) {
  if (!reviews?.length) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Reviews ({reviews.length})</Text>
      {reviews.map((r) => (
        <ReviewRow key={r.id} review={r} />
      ))}
    </View>
  );
}

function ReviewRow({ review }: { review: Review }) {
  // The backend's pre-find populate sets `user` to { name, photo } on Review.
  const user = typeof review.user === 'object' ? (review.user as User) : null;
  const photoUrl =
    user?.photo && /^https?:\/\//i.test(user.photo) ? user.photo : null;
  const date = new Date(review.createdAt).toLocaleDateString();

  return (
    <View style={styles.row}>
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
          <Text style={styles.name}>{user?.name ?? 'Anonymous'}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <Text style={styles.stars}>
          {'★'.repeat(review.rating)}
          <Text style={styles.starsDim}>
            {'★'.repeat(5 - review.rating)}
          </Text>
        </Text>
      </View>
      <Text style={styles.body}>{review.review}</Text>
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
  row: {
    backgroundColor: colors.cardBg,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  avatarPlaceholder: {
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontWeight: '700' },
  name: { fontSize: 14, fontWeight: '600', color: colors.textDark },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  stars: { fontSize: 16, color: colors.brandDark, letterSpacing: 1 },
  starsDim: { color: '#ddd' },
  body: { color: colors.textDark, lineHeight: 20, fontSize: 14 },
});
