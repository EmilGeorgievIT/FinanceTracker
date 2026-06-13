import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Paths } from 'expo-file-system';
import { useTheme } from '../../src/stores/useUiStore';
import { exportAllData } from '../../src/services/exportService';
import { validateImportData, importAllData } from '../../src/services/importService';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
}

export default function MoreScreen() {
  const theme = useTheme();

  const handleExport = async () => {
    try {
      const json = await exportAllData();
      const path = `${Paths.cache.uri}finance-tracker-backup.json`;
      await FileSystem.writeAsStringAsync(path, json);
      await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Export Finance Data' });
    } catch (e: any) {
      Alert.alert('Export Failed', e.message);
    }
  };

  const handleImport = async () => {
    try {
      const path = `${Paths.cache.uri}finance-tracker-backup.json`;
      const exists = await FileSystem.getInfoAsync(path);
      if (!exists.exists) {
        Alert.alert('No backup found', 'Export first, then import.');
        return;
      }
      const content = await FileSystem.readAsStringAsync(path);
      const data = JSON.parse(content);
      if (!validateImportData(data)) {
        Alert.alert('Invalid Data', 'Not a valid Finance Tracker backup.');
        return;
      }
      const result = await importAllData(data);
      Alert.alert('Import Complete', `Imported ${result.trackers} trackers, ${result.categories} categories, ${result.transactions} transactions.`);
    } catch (e: any) {
      Alert.alert('Import Failed', e.message);
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'download-outline',
      label: 'Export Data',
      subtitle: 'Save all tracker data to JSON',
      onPress: handleExport,
    },
    {
      icon: 'upload-outline',
      label: 'Import Data',
      subtitle: 'Load previously exported file',
      onPress: handleImport,
    },
    {
      icon: 'options-outline',
      label: 'Settings',
      subtitle: 'Appearance and preferences',
      onPress: () => router.push('/more/settings'),
    },
    {
      icon: 'list-outline',
      label: 'Manage Categories',
      subtitle: 'Edit expense categories',
      onPress: () => router.push('/categories'),
    },
    {
      icon: 'information-circle-outline',
      label: 'About',
      subtitle: 'Finance Tracker v1.0.0',
      onPress: () => Alert.alert('Finance Tracker', 'v1.0.0\nTrack your assets, debts, income and expenses.'),
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name={item.icon} size={22} color={theme.primary} />
          </View>
          <View style={styles.textBox}>
            <Text style={[styles.label, { color: theme.text }]}>{item.label}</Text>
            {item.subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text> : null}
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
        </TouchableOpacity>
      ))}

      <Text style={[styles.version, { color: theme.textTertiary }]}>v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, gap: 14 },
  iconBox: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  textBox: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 12, marginTop: 2 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 24 },
});
