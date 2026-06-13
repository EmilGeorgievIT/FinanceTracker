import { Stack } from 'expo-router';

export default function TrackersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Trackers' }} />
      <Stack.Screen name="[id]" options={{ title: 'Tracker' }} />
    </Stack>
  );
}
