import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { Booking } from '@natours/shared';
import { api } from '../../src/api/client';
import { colors } from '../../src/theme';

async function fetchMyBookings(): Promise<Booking[]> {
  const res = await api.get<{ data: Booking[] }>('/bookings/my-tours');
  return res.data.data;
}

export default function MyBookingsScreen() {
  const q = useQuery({ queryKey: ['my-bookings'], queryFn: fetchMyBookings });

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

  if (bookings.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.empty}
        refreshControl={
          <RefreshControl
            refreshing={q.isRefetching}
            onRefresh={() => q.refetch()}
            tintColor={colors.brand}
          />
        }
      >
        <Text style={styles.emptyTitle}>No bookings yet</Text>
        <Text style={styles.emptyHint}>
          Tap "Book this tour" on any tour to get started. Pull down to refresh
          after paying.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          tintColor={colors.brand}
        />
      }
    >
      {bookings.map((b) => (
        <BookingRow key={b.id} booking={b} />
      ))}
    </ScrollView>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  // The Nest pre-find populate sets booking.tour to { name, ... } and
  // booking.user to a populated user; fall back to id strings otherwise.
  const tourName =
    typeof booking.tour === 'object' && booking.tour
      ? booking.tour.name
      : `Tour ${booking.tour}`;
  const when = new Date(booking.createdAt).toLocaleDateString();

  return (
    <View style={styles.row}>
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
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: colors.danger },
  list: { padding: 16 },
  row: {
    flexDirection: 'row',
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
  tour: { fontSize: 16, fontWeight: '600', color: colors.textDark },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  priceCol: { alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: '700', color: colors.brandDark },
  paid: { color: colors.brandDark, fontWeight: '600' },
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
