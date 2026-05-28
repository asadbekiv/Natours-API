import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
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

async function fetchTours({
  pageParam,
}: {
  pageParam?: string;
}): Promise<ToursPage> {
  const res = await api.get<ToursPage>('/tours', {
    params: { limit: 10, ...(pageParam ? { cursor: pageParam } : {}) },
  });
  return res.data;
}

export default function ToursListScreen() {
  const router = useRouter();
  const q = useInfiniteQuery<ToursPage, Error, ToursPage, ['tours'], string | undefined>({
    queryKey: ['tours'],
    queryFn: fetchTours,
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextCursor,
  });

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

  const items = q.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <FlatList
      data={items}
      keyExtractor={(t) => t.id}
      renderItem={({ item }) => (
        <TourCard
          tour={item}
          onPress={() => router.push(`/(tabs)/tours/${item.id}`)}
        />
      )}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      refreshing={q.isRefetching && !q.isFetchingNextPage}
      onRefresh={() => q.refetch()}
      onEndReached={() => {
        if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
      }}
      onEndReachedThreshold={0.6}
      ListFooterComponent={
        q.isFetchingNextPage ? (
          <ActivityIndicator style={{ margin: 16 }} color={colors.brand} />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: colors.danger },
  list: { padding: 16 },
});
