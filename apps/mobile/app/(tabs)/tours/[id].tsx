import { useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, Snackbar } from 'react-native-paper';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import MapView, { Marker } from 'react-native-maps';
import {
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Booking, Tour } from '@natours/shared';
import { api } from '../../../src/api/client';
import { fetchMyBookings, myBookingsKey } from '../../../src/api/bookings';
import { useAuth } from '../../../src/auth/auth-context';
import { ReviewList } from '../../../src/components/ReviewList';
import { ReviewDialog } from '../../../src/components/ReviewDialog';
import { colors } from '../../../src/theme';

async function fetchTour(id: string): Promise<Tour> {
  const res = await api.get<{ data: Tour }>(`/tours/${id}`);
  return res.data.data;
}

export default function TourDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewPostedSnack, setReviewPostedSnack] = useState(false);

  const q = useQuery({
    queryKey: ['tour', id],
    queryFn: () => fetchTour(id),
    enabled: !!id,
  });

  // Used to decide whether to surface a "Write a review" button on this screen.
  const bookingsQ = useQuery({
    queryKey: myBookingsKey,
    queryFn: fetchMyBookings,
    enabled: !!user,
  });

  useLayoutEffect(() => {
    if (q.data) navigation.setOptions({ title: q.data.name });
  }, [q.data, navigation]);

  async function onBook() {
    setBookingError(null);
    setBookingLoading(true);
    try {
      const res = await api.get<{ session: { url: string } }>(
        `/bookings/checkout-session/${id}`,
      );
      const url = res.data.session.url;
      // Opens Stripe checkout in an in-app browser. The Stripe webhook on the
      // backend creates the Booking server-side as soon as payment goes
      // through; once the user dismisses the browser we jump to the Bookings
      // tab and invalidate the cache so the new row shows up automatically.
      await WebBrowser.openBrowserAsync(url);
      await queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      router.push('/(tabs)/bookings');
    } catch (err) {
      const e = err as {
        message?: string;
        response?: { data?: { message?: string }; status?: number };
      };
      setBookingError(
        e.response?.data?.message ?? e.message ?? 'Could not start checkout',
      );
    } finally {
      setBookingLoading(false);
    }
  }

  if (q.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }
  if (q.error || !q.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load tour</Text>
      </View>
    );
  }

  const t = q.data;
  const coverUrl = /^https?:\/\//i.test(t.imageCover) ? t.imageCover : null;

  // Booked → eligible to review. Already reviewed → hide the button.
  const hasBooking = bookingMatchesTour(bookingsQ.data, id);
  const alreadyReviewed = userHasReviewed(t.reviews, user?.id);
  const canReview = !!user && hasBooking && !alreadyReviewed;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {coverUrl ? (
        <Image
          source={coverUrl}
          style={styles.cover}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]} />
      )}

      <View style={styles.body}>
        <Text style={styles.title}>{t.name}</Text>
        <Text style={styles.summary}>{t.summary}</Text>

        <View style={styles.statsRow}>
          <Stat label="Duration" value={`${t.duration} days`} />
          <Stat label="Difficulty" value={t.difficulty} />
        </View>
        <View style={styles.statsRow}>
          <Stat label="Group size" value={`${t.maxGroupSize}`} />
          <Stat
            label="Rating"
            value={`${t.ratingsAverage.toFixed(1)} ★ (${t.ratingsQuantity})`}
          />
        </View>

        <Text style={styles.price}>${t.price}</Text>

        {t.description ? (
          <Text style={styles.description}>{t.description}</Text>
        ) : null}

        <TourMap tour={t} />

        {/* Reviews live between the map and the booking buttons so the CTA
            stays the last thing in the scroll. */}
        <ReviewList reviews={t.reviews} />

        {canReview ? (
          <Button
            mode="outlined"
            onPress={() => setReviewOpen(true)}
            style={styles.reviewBtn}
            contentStyle={styles.bookBtnContent}
            textColor={colors.brandDark}
          >
            Write a review
          </Button>
        ) : null}

        <Button
          mode="contained"
          onPress={onBook}
          loading={bookingLoading}
          disabled={bookingLoading}
          style={styles.bookBtn}
          contentStyle={styles.bookBtnContent}
        >
          {bookingLoading ? 'Opening checkout…' : 'Book this tour'}
        </Button>
        {bookingError ? (
          <Text style={styles.bookError}>{bookingError}</Text>
        ) : null}
      </View>

      <ReviewDialog
        visible={reviewOpen}
        tourId={id}
        tourName={t.name}
        onClose={() => setReviewOpen(false)}
        onSubmitted={() => setReviewPostedSnack(true)}
      />

      <Snackbar
        visible={reviewPostedSnack}
        onDismiss={() => setReviewPostedSnack(false)}
        duration={2500}
        style={{ backgroundColor: colors.brandDark }}
      >
        Review posted ✓
      </Snackbar>
    </ScrollView>
  );
}

// --- helpers --------------------------------------------------------------

function bookingMatchesTour(
  bookings: Booking[] | undefined,
  tourId: string | undefined,
): boolean {
  if (!bookings || !tourId) return false;
  return bookings.some((b) => {
    if (typeof b.tour === 'object' && b.tour) {
      const t = b.tour as Record<string, unknown>;
      return t.id === tourId || t._id === tourId;
    }
    return b.tour === tourId;
  });
}

function userHasReviewed(
  reviews: Tour['reviews'] | undefined,
  userId: string | undefined,
): boolean {
  if (!reviews || !userId) return false;
  return reviews.some((r) => {
    if (typeof r.user === 'object' && r.user) {
      const u = r.user as Record<string, unknown>;
      return u.id === userId || u._id === userId;
    }
    return r.user === userId;
  });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
}

function TourMap({ tour }: { tour: Tour }) {
  // Tour locations are GeoJSON [lng, lat]; react-native-maps wants {lat, lng}.
  const points: MapPoint[] = [];
  if (tour.startLocation?.coordinates) {
    const [lng, lat] = tour.startLocation.coordinates;
    points.push({
      id: 'start',
      lat,
      lng,
      title: 'Start',
      description:
        tour.startLocation.description ?? tour.startLocation.address ?? '',
    });
  }
  tour.locations?.forEach((loc, i) => {
    if (loc.coordinates) {
      const [lng, lat] = loc.coordinates;
      points.push({
        id: `loc-${i}`,
        lat,
        lng,
        title: loc.description ?? `Day ${loc.day ?? i + 1}`,
        description: loc.day != null ? `Day ${loc.day}` : undefined,
      });
    }
  });

  if (points.length === 0) return null;

  // Fit the initial region around all the points, with some padding.
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const region = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.2, (maxLat - minLat) * 1.6),
    longitudeDelta: Math.max(0.2, (maxLng - minLng) * 1.6),
  };

  return (
    <View style={styles.mapWrap}>
      <Text style={styles.mapTitle}>Where you'll go</Text>
      <MapView style={styles.map} initialRegion={region}>
        {points.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            title={p.title}
            description={p.description}
            pinColor={colors.brandDark}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: colors.danger },
  cover: { width: '100%', height: 260, backgroundColor: '#eee' },
  coverPlaceholder: { backgroundColor: colors.brandLight, opacity: 0.3 },
  body: { padding: 20 },
  title: { fontSize: 26, fontWeight: '700', color: colors.textDark },
  summary: {
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  stat: { flex: 1 },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.brandDark,
    marginTop: 8,
  },
  description: {
    color: colors.textDark,
    marginTop: 20,
    lineHeight: 22,
    fontSize: 15,
  },
  bookBtn: { marginTop: 12, borderRadius: 6 },
  reviewBtn: {
    marginTop: 28,
    borderRadius: 6,
    borderColor: colors.brandDark,
  },
  bookBtnContent: { paddingVertical: 8 },
  bookError: { color: colors.danger, marginTop: 8, textAlign: 'center' },
  mapWrap: { marginTop: 24 },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 8,
  },
  map: { width: '100%', height: 240, borderRadius: 8 },
});
