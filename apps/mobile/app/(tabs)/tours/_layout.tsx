import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { colors } from '../../../src/theme';

// Brand mark in the Tours stack header. White-on-transparent reads best on
// the green bar; swap the PNG if you have a different variant.
const logo = require('../../../assets/logo.png');

export default function ToursStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.brand },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Image
              source={logo}
              style={{ width: 110, height: 32 }}
              contentFit="contain"
            />
          ),
        }}
      />
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  );
}
