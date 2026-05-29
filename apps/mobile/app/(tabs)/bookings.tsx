import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Button,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Booking } from '@natours/shared';
import { api } from '../../src/api/client';
import { colors } from '../../src/theme';

async function fetchMyBookings(): Promise<Booking[]> {
  const res = await api.get<{ data: Booking[] }>('/bookings/my-tours');
  return res.data.data;
}

export default function MyBookingsScreen() {
  const q = useQuery({ queryKey: ['my-bookings'], queryFn: fetchMyBookings });
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

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
          bookings.map((b) => (
            <BookingRow
              key={b.id}
              booking={b}
              onWriteReview={() => setReviewBooking(b)}
            />
          ))
        )}
      </ScrollView>

      <ReviewDialog
        booking={reviewBooking}
        onClose={() => setReviewBooking(null)}
      />
    </>
  );
}

function BookingRow({
  booking,
  onWriteReview,
}: {
  booking: Booking;
  onWriteReview: () => void;
}) {
  const tourName =
    typeof booking.tour === 'object' && booking.tour
      ? booking.tour.name
      : `Tour ${booking.tour}`;
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
      <Button
        mode="text"
        onPress={onWriteReview}
        textColor={colors.brandDark}
        style={styles.reviewBtn}
      >
        Write a review
      </Button>
    </View>
  );
}

function ReviewDialog({
  booking,
  onClose,
}: {
  booking: Booking | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // booking.tour may be a populated subdoc ({ _id, id?, name }) or a plain id string.
  const tourObj =
    booking && typeof booking.tour === 'object'
      ? (booking.tour as Record<string, unknown>)
      : null;
  const tourId =
    (tourObj?.id as string | undefined) ??
    (tourObj?._id as string | undefined) ??
    (typeof booking?.tour === 'string' ? booking.tour : undefined);
  const tourName =
    (tourObj?.name as string | undefined) ?? '';

  const mutation = useMutation({
    mutationFn: async () => {
      if (!tourId) throw new Error('No tour found on this booking');
      // eslint-disable-next-line no-console
      console.log('[review] submitting', {
        tourId,
        rating,
        reviewLen: text.length,
      });
      const res = await api.post(`/tours/${tourId}/reviews`, {
        rating,
        review: text,
      });
      // eslint-disable-next-line no-console
      console.log('[review] success', res.status, res.data);
    },
    onSuccess: () => {
      if (tourId) {
        void queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }
      handleClose();
    },
    onError: (err) => {
      const e = err as {
        message?: string;
        response?: { data?: { message?: string }; status?: number };
      };
      setError(
        e.response?.data?.message ??
          (e.response
            ? `HTTP ${e.response.status} — ${JSON.stringify(e.response.data)}`
            : e.message ?? 'Could not submit review'),
      );
    },
  });

  function handleClose() {
    setRating(5);
    setText('');
    setError(null);
    mutation.reset();
    onClose();
  }

  return (
    <Portal>
      <Dialog visible={!!booking} onDismiss={handleClose}>
        <Dialog.Title>Leave a review</Dialog.Title>
        <Dialog.Content>
          {tourName ? (
            <Text style={styles.dialogTourName}>{tourName}</Text>
          ) : null}
          <StarPicker value={rating} onChange={setRating} />
          <TextInput
            mode="outlined"
            label="Your review"
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            style={styles.reviewInput}
          />
          {error ? <Text style={styles.dialogError}>{error}</Text> : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleClose}>Cancel</Button>
          <Button
            mode="contained"
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={mutation.isPending || text.trim().length === 0}
          >
            Submit
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable
          key={i}
          onPress={() => onChange(i)}
          style={styles.starPress}
          accessibilityLabel={`${i} star${i === 1 ? '' : 's'}`}
        >
          <Ionicons
            name={i <= value ? 'star' : 'star-outline'}
            size={32}
            color={i <= value ? colors.star : '#d8d8d8'}
          />
        </Pressable>
      ))}
    </View>
  );
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

  dialogTourName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
  },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  starPress: { paddingHorizontal: 6 },
  reviewInput: { backgroundColor: '#fff' },
  dialogError: { color: colors.danger, marginTop: 8 },
});
