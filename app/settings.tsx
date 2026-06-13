import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useUiStore, type ColorSchemeSetting } from '../src/stores/useUiStore';

const THEME_OPTIONS: { key: ColorSchemeSetting; label: string }[] = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const colorSchemeSetting = useUiStore((s) => s.colorSchemeSetting);
  const setColorSchemeSetting = useUiStore((s) => s.setColorSchemeSetting);

  return (
    <ScrollView style={[{ backgroundColor: theme.background }]} contentContainerStyle={styles.container}>
      <Stack.Screen options={{
        headerTitle: 'Settings',
        headerStyle: { backgroundColor: theme.headerBg },
        headerTitleStyle: { color: theme.text },
      }} />

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
      <View style={[styles.themeRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {THEME_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.themeBtn,
              colorSchemeSetting === opt.key && { backgroundColor: theme.primary },
            ]}
            onPress={() => setColorSchemeSetting(opt.key)}
          >
            <Text style={[styles.themeBtnText, { color: colorSchemeSetting === opt.key ? '#fff' : theme.textSecondary }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  themeRow: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginBottom: 24 },
  themeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  themeBtnText: { fontSize: 14, fontWeight: '600' },
});
