import { Stack } from 'expo-router';
import { colors } from '../../../src/theme';

export default function ToursStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.brand },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Natours' }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  );
}
