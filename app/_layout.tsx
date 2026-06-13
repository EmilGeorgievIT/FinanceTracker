import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { initializeDatabase } from '../src/db/seed';

function DbInit({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDatabase().then(() => setReady(true)).catch((e) => {
      console.error('DB init failed:', e);
      setError(String(e));
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={{ marginTop: 12, color: '#666', fontSize: 16 }}>Setting up…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#c0392b', marginBottom: 8 }}>Startup Error</Text>
        <Text style={{ color: '#666', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <DbInit>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </DbInit>
  );
}
