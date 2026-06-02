import { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import type { Booking } from '@natours/shared';
import { fetchMyBookings, myBookingsKey } from '../../src/api/bookings';
import {
  fetchMyReviews,
  myReviewsKey,
  reviewedTourIdSet,
} from '../../src/api/reviews';
import { ReviewDialog } from '../../src/components/ReviewDialog';
import { colors } from '../../src/theme';

export default function MyBookingsScreen() {
  const q = useQuery({ queryKey: myBookingsKey, queryFn: fetchMyBookings });
  const reviewsQ = useQuery({
    queryKey: myReviewsKey,
    queryFn: fetchMyReviews,
  });
  const reviewedTours = reviewedTourIdSet(reviewsQ.data);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [snack, setSnack] = useState(false);

  if (q.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }
  if (q.error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{q.error.message}</Text>
      </View>
    );
  }

  const bookings = q.data ?? [];

  return (
    <>
      <ScrollView
        contentContainerStyle={
          bookings.length === 0 ? styles.empty : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={q.isRefetching}
            onRefresh={() => q.refetch()}
            tintColor={colors.brand}
          />
        }
      >
        {bookings.length === 0 ? (
          <>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyHint}>
              Tap "Book this tour" on any tour to get started. Pull down to
              refresh after paying.
            </Text>
          </>
        ) : (
          bookings.map((b) => {
            const tourId = getTourId(b);
            const alreadyReviewed = !!tourId && reviewedTours.has(tourId);
            return (
              <BookingRow
                // Defensive: older responses lacked the `id` virtual.
                key={b.id ?? (b as unknown as { _id: string })._id}
                booking={b}
                alreadyReviewed={alreadyReviewed}
                onWriteReview={() => setReviewBooking(b)}
              />
            );
          })
        )}
      </ScrollView>

      <ReviewDialog
        visible={!!reviewBooking}
        tourId={getTourId(reviewBooking)}
        tourName={getTourName(reviewBooking)}
        onClose={() => setReviewBooking(null)}
        onSubmitted={() => setSnack(true)}
      />

      <Snackbar
        visible={snack}
        onDismiss={() => setSnack(false)}
        duration={2500}
        style={{ backgroundColor: colors.brandDark }}
      >
        Review posted ✓ — open the tour to see it.
      </Snackbar>
    </>
  );
}

function BookingRow({
  booking,
  alreadyReviewed,
  onWriteReview,
}: {
  booking: Booking;
  alreadyReviewed: boolean;
  onWriteReview: () => void;
}) {
  const tourName = getTourName(booking) ?? `Tour ${booking.tour}`;
  const when = new Date(booking.createdAt).toLocaleDateString();

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.tour}>{tourName}</Text>
          <Text style={styles.meta}>Booked {when}</Text>
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.price}>${booking.price}</Text>
          <Text style={[styles.meta, booking.paid && styles.paid]}>
            {booking.paid ? 'Paid' : 'Pending'}
          </Text>
        </View>
      </View>
      {alreadyReviewed ? (
        <Text style={styles.reviewed}>Reviewed ✓</Text>
      ) : (
        <Button
          mode="text"
          onPress={onWriteReview}
          textColor={colors.brandDark}
          style={styles.reviewBtn}
        >
          Write a review
        </Button>
      )}
    </View>
  );
}

// --- helpers: booking.tour may be a populated subdoc or a plain id string. ---
function getTourId(booking: Booking | null): string | undefined {
  if (!booking) return undefined;
  if (typeof booking.tour === 'object' && booking.tour) {
    const t = booking.tour as Record<string, unknown>;
    return (t.id as string | undefined) ?? (t._id as string | undefined);
  }
  return typeof booking.tour === 'string' ? booking.tour : undefined;
}

function getTourName(booking: Booking | null): string | undefined {
  if (!booking) return undefined;
  if (typeof booking.tour === 'object' && booking.tour) {
    return (booking.tour as Record<string, unknown>).name as
      | string
      | undefined;
  }
  return undefined;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: colors.danger },
  list: { padding: 16 },
  row: {
    backgroundColor: colors.cardBg,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  rowHeader: { flexDirection: 'row' },
  tour: { fontSize: 16, fontWeight: '600', color: colors.textDark },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  priceCol: { alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: '700', color: colors.brandDark },
  paid: { color: colors.brandDark, fontWeight: '600' },
  reviewBtn: { alignSelf: 'flex-start', marginTop: 6, marginLeft: -8 },
  reviewed: {
    marginTop: 8,
    color: colors.brandDark,
    fontWeight: '600',
    fontSize: 13,
  },

  empty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 8,
  },
  emptyHint: { color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
