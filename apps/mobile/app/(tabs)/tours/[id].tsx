import { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { Tour } from '@natours/shared';
import { api } from '../../../src/api/client';
import { colors } from '../../../src/theme';

async function fetchTour(id: string): Promise<Tour> {
  const res = await api.get<{ data: Tour }>(`/tours/${id}`);
  return res.data.data;
}

export default function TourDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const q = useQuery({
    queryKey: ['tour', id],
    queryFn: () => fetchTour(id),
    enabled: !!id,
  });

  useLayoutEffect(() => {
    if (q.data) navigation.setOptions({ title: q.data.name });
  }, [q.data, navigation]);

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
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
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
});
