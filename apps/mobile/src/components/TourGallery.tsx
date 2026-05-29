import { useState } from 'react';
import {
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_WIDTH = Math.round(SCREEN_WIDTH * 0.85);
const IMAGE_HEIGHT = Math.round((IMAGE_WIDTH * 2) / 3); // 3:2 aspect (matches Natours photos)
const GAP = 12;
const SIDE_INSET = Math.round((SCREEN_WIDTH - IMAGE_WIDTH) / 2);

/**
 * Horizontal swipeable gallery of a tour's `images` array.
 * Snap-to-image with the previous/next photo peeking at the edges, plus
 * pagination dots below (elongated active style, hidden for a single image).
 */
export function TourGallery({ images }: { images: string[] | undefined }) {
  const urls = (images ?? []).filter((u) => /^https?:\/\//i.test(u));
  const [activeIndex, setActiveIndex] = useState(0);

  if (urls.length === 0) return null;

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / (IMAGE_WIDTH + GAP));
    setActiveIndex(Math.max(0, Math.min(idx, urls.length - 1)));
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={IMAGE_WIDTH + GAP}
        decelerationRate="fast"
        snapToAlignment="center"
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={{ paddingHorizontal: SIDE_INSET }}
      >
        {urls.map((url, i) => (
          <Image
            key={`${url}-${i}`}
            source={url}
            style={[
              styles.image,
              { marginRight: i < urls.length - 1 ? GAP : 0 },
            ]}
            contentFit="cover"
            transition={250}
          />
        ))}
      </ScrollView>

      {urls.length > 1 ? (
        <View style={styles.dots}>
          {urls.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12, marginBottom: 8 },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dcdcdc',
  },
  // Elongated active dot — current Instagram / Airbnb style.
  dotActive: {
    backgroundColor: colors.brand,
    width: 18,
  },
});
