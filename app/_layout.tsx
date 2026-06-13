import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { initializeDatabase } from '../src/db/seed';
import { useTheme, useIsDark } from '../src/stores/useUiStore';

function DbInit({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    initializeDatabase().then(() => setReady(true)).catch((e) => {
      console.error('DB init failed:', e);
      setError(String(e));
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 12, color: theme.textSecondary, fontSize: 16 }}>Setting up…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background, padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.danger, marginBottom: 8 }}>Startup Error</Text>
        <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const isDark = useIsDark();

  return (
    <DbInit>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </DbInit>
  );
}
