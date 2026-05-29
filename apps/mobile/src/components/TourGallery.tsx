import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_WIDTH = Math.round(SCREEN_WIDTH * 0.85);
const IMAGE_HEIGHT = Math.round((IMAGE_WIDTH * 2) / 3); // 3:2 aspect (matches Natours photos)
const GAP = 12;
const SIDE_INSET = Math.round((SCREEN_WIDTH - IMAGE_WIDTH) / 2);

/**
 * Horizontal swipeable gallery of a tour's `images` array.
 * Snap-to-image with the previous/next photo peeking at the edges so users
 * see there's more to swipe.
 */
export function TourGallery({ images }: { images: string[] | undefined }) {
  // Only show entries that are absolute URLs (e.g. ImageKit). Legacy seed
  // entries are bare filenames and would render as broken images.
  const urls = (images ?? []).filter((u) => /^https?:\/\//i.test(u));
  if (urls.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={IMAGE_WIDTH + GAP}
        decelerationRate="fast"
        snapToAlignment="center"
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12, marginBottom: 4 },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
});
