import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Paths } from 'expo-file-system';
import { useTheme, useUiStore, useT, type ColorSchemeSetting, type Language } from '../../src/stores/useUiStore';
import { exportAllData } from '../../src/services/exportService';
import { validateImportData, importAllData } from '../../src/services/importService';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
}

const THEME_OPTIONS: { key: ColorSchemeSetting; label: string }[] = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

const LANG_OPTIONS: { key: Language; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'bg', label: 'Български' },
];

export default function MoreScreen() {
  const theme = useTheme();
  const t = useT();
  const colorSchemeSetting = useUiStore((s) => s.colorSchemeSetting);
  const setColorSchemeSetting = useUiStore((s) => s.setColorSchemeSetting);
  const language = useUiStore((s) => s.language);
  const setLanguage = useUiStore((s) => s.setLanguage);

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
      label: t('exportData'),
      subtitle: t('exportSubtitle'),
      onPress: handleExport,
    },
    {
      icon: 'cloud-upload-outline',
      label: t('importData'),
      subtitle: t('importSubtitle'),
      onPress: handleImport,
    },
    {
      icon: 'information-circle-outline',
      label: t('about'),
      subtitle: 'Finance Tracker v1.0.0',
      onPress: () => Alert.alert('Finance Tracker', 'v1.0.0'),
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Appearance */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('appearance')}</Text>
      <View style={[styles.segmentRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {THEME_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.segmentBtn, colorSchemeSetting === opt.key && { backgroundColor: theme.primary }]}
            onPress={() => setColorSchemeSetting(opt.key)}
          >
            <Text style={[styles.segmentText, { color: colorSchemeSetting === opt.key ? '#fff' : theme.textSecondary }]}>
              {opt.key === 'system' ? t('system') : opt.key === 'light' ? t('light') : t('dark')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Language */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>{t('language')}</Text>
      <View style={[styles.segmentRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {LANG_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.segmentBtn, language === opt.key && { backgroundColor: theme.primary }]}
            onPress={() => setLanguage(opt.key)}
          >
            <Text style={[styles.segmentText, { color: language === opt.key ? '#fff' : theme.textSecondary }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu items */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Data</Text>
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
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  segmentRow: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginBottom: 8 },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentText: { fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, gap: 14 },
  iconBox: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  textBox: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 12, marginTop: 2 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 24 },
});
