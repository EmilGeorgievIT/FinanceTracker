import { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  Alert, StyleSheet, ScrollView,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Paths } from 'expo-file-system';
import { useCategories, useCategoryActions } from '../../../src/hooks/useCategories';
import { exportAllData } from '../../../src/services/exportService';
import { validateImportData, importAllData } from '../../../src/services/importService';
import { Button } from '../../../src/components/ui/Button';
import { useTheme, useUiStore, type ColorSchemeSetting } from '../../../src/stores/useUiStore';
import type { CategoryRow } from '../../../src/repositories/categoryRepository';

const THEME_OPTIONS: { key: ColorSchemeSetting; label: string }[] = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const colorSchemeSetting = useUiStore((s) => s.colorSchemeSetting);
  const setColorSchemeSetting = useUiStore((s) => s.setColorSchemeSetting);
  const { categories, loading, refresh } = useCategories();
  const { add, rename, remove } = useCategoryActions();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [importing, setImporting] = useState(false);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    await add(trimmed);
    setNewName('');
    refresh();
  };

  const handleRename = async (id: number) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    await rename(id, trimmed);
    setEditingId(null);
    setEditName('');
    refresh();
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert('Delete', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await remove(id); refresh(); } },
    ]);
  };

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
    setImporting(true);
    try {
      // For import, we use a hardcoded path — in production, use expo-document-picker
      // This is a simple version: read from a known cache location
      const path = `${Paths.cache.uri}finance-tracker-backup.json`;
      const exists = await FileSystem.getInfoAsync(path);
      if (!exists.exists) {
        Alert.alert('No backup found', 'Export first, then import from the same file.');
        return;
      }
      const content = await FileSystem.readAsStringAsync(path);
      const data = JSON.parse(content);
      if (!validateImportData(data)) {
        Alert.alert('Invalid Data', 'The file is not a valid Finance Tracker backup.');
        return;
      }
      const result = await importAllData(data);
      Alert.alert(
        'Import Complete',
        `Imported: ${result.trackers} trackers, ${result.categories} categories, ${result.transactions} transactions.`
      );
      refresh();
    } catch (e: any) {
      Alert.alert('Import Failed', e.message);
    } finally {
      setImporting(false);
    }
  };

  const renderItem = ({ item }: { item: CategoryRow }) => (
    <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {editingId === item.id ? (
        <TextInput
          style={[styles.editInput, { borderColor: theme.primary, color: theme.inputText }]}
          value={editName}
          onChangeText={setEditName}
          autoFocus
          onSubmitEditing={() => handleRename(item.id)}
          onBlur={() => { setEditingId(null); setEditName(''); }}
        />
      ) : (
        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
      )}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => { setEditingId(item.id); setEditName(item.name); }}>
          <Text style={[styles.editText, { color: theme.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
          <Text style={[styles.deleteText, { color: theme.danger }]}>Del</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Appearance */}
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

      {/* Data section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Data</Text>
      <View style={{ gap: 10, marginBottom: 24 }}>
        <Button title="Export Data (JSON)" onPress={handleExport} />
        <Button title={importing ? 'Importing…' : 'Import Data (JSON)'} variant="secondary" onPress={handleImport} />
      </View>

      {/* Categories */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.inputText }]}
          placeholderTextColor={theme.inputPlaceholder}
          value={newName}
          onChangeText={setNewName}
          placeholder="New category"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={[styles.loading, { color: theme.textTertiary }]}>Loading…</Text>
      ) : (
        categories.map((cat) => <View key={cat.id}>{renderItem({ item: cat })}</View>)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  themeRow: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginBottom: 24 },
  themeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  themeBtnText: { fontSize: 14, fontWeight: '600' },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 15 },
  addBtn: { backgroundColor: '#4A90D9', borderRadius: 8, paddingHorizontal: 20, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 8, marginBottom: 8, borderWidth: 1 },
  name: { flex: 1, fontSize: 16 },
  actions: { flexDirection: 'row', gap: 12 },
  editText: { fontWeight: '600' },
  deleteText: { fontWeight: '600' },
  editInput: { flex: 1, borderWidth: 1, borderRadius: 6, padding: 8, fontSize: 15 },
  loading: { textAlign: 'center', marginTop: 20 },
});
