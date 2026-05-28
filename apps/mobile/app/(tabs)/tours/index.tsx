import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import type { Tour } from '@natours/shared';
import { api } from '../../../src/api/client';
import { TourCard } from '../../../src/components/TourCard';
import { colors } from '../../../src/theme';

interface ToursPage {
  data: Tour[];
  results: number;
  nextCursor?: string;
}

async function fetchTours(): Promise<ToursPage> {
  // Bigger page for now — there are only ~9 seed tours. Infinite-scroll
  // (FlatList + useInfiniteQuery) is parked while a RN 0.81 / Expo Go 54
  // FlatList feature-flag check is flaky; will restore once stable.
  const res = await api.get<ToursPage>('/tours', { params: { limit: 50 } });
  return res.data;
}

export default function ToursListScreen() {
  const router = useRouter();
  const q = useQuery({ queryKey: ['tours'], queryFn: fetchTours });

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

  const tours = q.data?.data ?? [];

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
      {tours.map((tour) => (
        <View key={tour.id} style={styles.item}>
          <TourCard
            tour={tour}
            onPress={() => router.push(`/(tabs)/tours/${tour.id}`)}
          />
        </View>
      ))}
      {tours.length === 0 ? (
        <Text style={styles.empty}>No tours yet.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: colors.danger },
  list: { padding: 16 },
  item: { marginBottom: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
});
