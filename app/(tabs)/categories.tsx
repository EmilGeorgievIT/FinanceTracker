import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { useCategories, useCategoryActions } from '../../src/hooks/useCategories';
import { useTheme } from '../../src/stores/useUiStore';
import type { CategoryRow } from '../../src/repositories/categoryRepository';

export default function CategoriesScreen() {
  const theme = useTheme();
  const { categories, loading, refresh } = useCategories();
  const { add, rename, remove } = useCategoryActions();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

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
    Alert.alert('Delete Category', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await remove(id); refresh(); } },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.inputText }]}
          placeholderTextColor={theme.inputPlaceholder}
          value={newName}
          onChangeText={setNewName}
          placeholder="New category"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={[styles.loading, { color: theme.textTertiary }]}>Loading…</Text>
      ) : categories.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textTertiary }]}>No categories yet</Text>
      ) : (
        categories.map((cat) => (
          <View key={cat.id} style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {editingId === cat.id ? (
              <TextInput
                style={[styles.editInput, { borderColor: theme.primary, color: theme.inputText }]}
                value={editName}
                onChangeText={setEditName}
                autoFocus
                onSubmitEditing={() => handleRename(cat.id)}
                onBlur={() => { setEditingId(null); setEditName(''); }}
              />
            ) : (
              <Text style={[styles.name, { color: theme.text }]}>{cat.name}</Text>
            )}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => { setEditingId(cat.id); setEditName(cat.name); }}>
                <Text style={[styles.editText, { color: theme.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(cat.id, cat.name)}>
                <Text style={[styles.deleteText, { color: theme.danger }]}>Del</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 15 },
  addBtn: { borderRadius: 8, paddingHorizontal: 20, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 8, marginBottom: 8, borderWidth: 1 },
  name: { flex: 1, fontSize: 16 },
  actions: { flexDirection: 'row', gap: 12 },
  editText: { fontWeight: '600' },
  deleteText: { fontWeight: '600' },
  editInput: { flex: 1, borderWidth: 1, borderRadius: 6, padding: 8, fontSize: 15 },
  loading: { textAlign: 'center', marginTop: 20 },
  empty: { textAlign: 'center', fontSize: 15, marginTop: 40 },
});
