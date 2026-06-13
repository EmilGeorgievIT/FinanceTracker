import { useState } from 'react';
import {
  View, Text, FlatList, Modal, Alert,
  StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import {
  useTrackers,
  useCreateSavingsGoal,
  useCreateIncomeTracker,
  useCreateExpenseTracker,
  useCreateMortgage,
  useCreateLoan,
  useCreateVariableHolding,
  useDeleteTracker,
} from '../../../src/hooks/useTrackers';
import { useCategories } from '../../../src/hooks/useCategories';
import { TrackerCard } from '../../../src/components/tracker/TrackerCard';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import type { TrackerType } from '../../../src/types/enums';

const TRACKER_TYPE_OPTIONS: { key: TrackerType; label: string }[] = [
  { key: 'savings_goal', label: 'Savings' },
  { key: 'variable_holding', label: 'Holding' },
  { key: 'mortgage', label: 'Mortgage' },
  { key: 'loan', label: 'Loan' },
  { key: 'income', label: 'Income' },
  { key: 'expense', label: 'Expense' },
];

export default function TrackersScreen() {
  const { trackers, loading, refresh } = useTrackers();
  const createSavingsGoal = useCreateSavingsGoal();
  const createIncome = useCreateIncomeTracker();
  const createExpense = useCreateExpenseTracker();
  const createMortgage = useCreateMortgage();
  const createLoan = useCreateLoan();
  const createHolding = useCreateVariableHolding();
  const deleteTracker = useDeleteTracker();
  const { categories } = useCategories();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<TrackerType>('savings_goal');

  // Form
  const [fName, setFName] = useState('');
  const [fTarget, setFTarget] = useState('');
  const [fMonthly, setFMonthly] = useState('');
  const [fPriority, setFPriority] = useState('0');
  const [fIncomeAmt, setFIncomeAmt] = useState('');
  const [fPayDay, setFPayDay] = useState('1');
  const [fExpAmt, setFExpAmt] = useState('');
  const [fExpFreq, setFExpFreq] = useState<'monthly' | 'one_off'>('monthly');
  const [fExpDay, setFExpDay] = useState('1');
  const [fExpCat, setFExpCat] = useState<number | undefined>();
  const [fPrincipal, setFPrincipal] = useState('');
  const [fBalance, setFBalance] = useState('');
  const [fRate, setFRate] = useState('');
  const [fPayment, setFPayment] = useState('');
  const [fPropValue, setFPropValue] = useState('');
  const [fTicker, setFTicker] = useState('');
  const [fUnits, setFUnits] = useState('');
  const [fAvgPrice, setFAvgPrice] = useState('');

  const resetForm = () => {
    setFName(''); setFTarget(''); setFMonthly(''); setFPriority('0');
    setFIncomeAmt(''); setFPayDay('1'); setFExpAmt(''); setFExpDay('1');
    setFExpCat(undefined); setFPrincipal(''); setFBalance(''); setFRate('');
    setFPayment(''); setFPropValue(''); setFTicker(''); setFUnits(''); setFAvgPrice('');
  };

  const p = (s: string) => parseFloat(s) || 0;

  const handleAdd = async () => {
    const name = fName.trim();
    if (!name) return;

    if (selectedType === 'savings_goal') {
      if (!fTarget.trim()) return;
      await createSavingsGoal({ name, targetAmount: p(fTarget), monthlyContribution: p(fMonthly), priority: parseInt(fPriority, 10) || 0 });
    } else if (selectedType === 'income') {
      await createIncome({ name, netMonthlyAmount: p(fIncomeAmt), paymentDay: parseInt(fPayDay, 10) || 1 });
    } else if (selectedType === 'expense') {
      await createExpense({ name, amount: p(fExpAmt), frequency: fExpFreq, dateValue: parseInt(fExpDay, 10) || 1, categoryId: fExpCat });
    } else if (selectedType === 'mortgage') {
      await createMortgage({ name, principal: p(fPrincipal), balance: p(fBalance), interestRate: p(fRate), monthlyPayment: p(fPayment), propertyValue: p(fPropValue) });
    } else if (selectedType === 'loan') {
      await createLoan({ name, principal: p(fPrincipal), balance: p(fBalance), interestRate: p(fRate), monthlyPayment: p(fPayment) });
    } else if (selectedType === 'variable_holding') {
      await createHolding({ name, ticker: fTicker.trim(), units: p(fUnits), avgPurchasePrice: p(fAvgPrice) });
    }
    resetForm();
    setModalVisible(false);
    refresh();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={trackers}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TrackerCard tracker={item} onPress={() => router.push(`/trackers/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No trackers yet. Tap + to add one.</Text> : null}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Tracker</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.typeRow}>
              {TRACKER_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.typeBtn, selectedType === opt.key && styles.typeBtnSelected]}
                  onPress={() => setSelectedType(opt.key)}
                >
                  <Text style={[styles.typeBtnText, selectedType === opt.key && styles.typeBtnTextSelected]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Name" placeholder="Tracker name" value={fName} onChangeText={setFName} />

            {selectedType === 'savings_goal' && (
              <>
                <Input label="Target Amount (EUR)" keyboardType="decimal-pad" value={fTarget} onChangeText={setFTarget} />
                <Input label="Monthly Contribution (EUR)" keyboardType="decimal-pad" value={fMonthly} onChangeText={setFMonthly} />
                <Input label="Priority (0 = highest)" keyboardType="number-pad" value={fPriority} onChangeText={setFPriority} />
              </>
            )}
            {selectedType === 'income' && (
              <>
                <Input label="Net Monthly Amount (EUR)" keyboardType="decimal-pad" value={fIncomeAmt} onChangeText={setFIncomeAmt} />
                <Input label="Payment Day (1-31)" keyboardType="number-pad" value={fPayDay} onChangeText={setFPayDay} />
              </>
            )}
            {selectedType === 'expense' && (
              <>
                <Input label="Amount (EUR)" keyboardType="decimal-pad" value={fExpAmt} onChangeText={setFExpAmt} />
                <Text style={styles.fieldLabel}>Frequency</Text>
                <View style={styles.typeRow}>
                  {(['monthly', 'one_off'] as const).map((f) => (
                    <TouchableOpacity key={f} style={[styles.typeBtn, fExpFreq === f && styles.typeBtnSelected]} onPress={() => setFExpFreq(f)}>
                      <Text style={[styles.typeBtnText, fExpFreq === f && styles.typeBtnTextSelected]}>{f === 'monthly' ? 'Monthly' : 'One-off'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Input label={fExpFreq === 'monthly' ? 'Day of Month' : 'Date'} keyboardType="number-pad" value={fExpDay} onChangeText={setFExpDay} />
                <Text style={styles.fieldLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {categories.map((cat) => (
                      <TouchableOpacity key={cat.id} style={[styles.typeBtn, fExpCat === cat.id && styles.typeBtnSelected]} onPress={() => setFExpCat(cat.id)}>
                        <Text style={[styles.typeBtnText, fExpCat === cat.id && styles.typeBtnTextSelected]}>{cat.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}
            {(selectedType === 'mortgage' || selectedType === 'loan') && (
              <>
                <Input label="Original Principal (EUR)" keyboardType="decimal-pad" value={fPrincipal} onChangeText={setFPrincipal} />
                <Input label="Current Balance (EUR)" keyboardType="decimal-pad" value={fBalance} onChangeText={setFBalance} />
                <Input label="Annual Interest Rate (%)" keyboardType="decimal-pad" value={fRate} onChangeText={setFRate} />
                <Input label="Monthly Payment (EUR)" keyboardType="decimal-pad" value={fPayment} onChangeText={setFPayment} />
                {selectedType === 'mortgage' && (
                  <Input label="Property Value (EUR)" keyboardType="decimal-pad" value={fPropValue} onChangeText={setFPropValue} />
                )}
              </>
            )}
            {selectedType === 'variable_holding' && (
              <>
                <Input label="Ticker Symbol" placeholder="e.g. BTC-USD, AAPL" value={fTicker} onChangeText={setFTicker} autoCapitalize="characters" />
                <Input label="Units Held" keyboardType="decimal-pad" value={fUnits} onChangeText={setFUnits} />
                <Input label="Avg Purchase Price (EUR)" keyboardType="decimal-pad" value={fAvgPrice} onChangeText={setFAvgPrice} />
              </>
            )}
            <Button title={`Create ${TRACKER_TYPE_OPTIONS.find((t) => t.key === selectedType)?.label ?? ''}`} onPress={handleAdd} style={{ marginTop: 12 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  list: { padding: 16, paddingBottom: 100 },
  empty: { textAlign: 'center', color: '#999', fontSize: 15, marginTop: 40 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4A90D9', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30, fontWeight: '300' },
  modalContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  cancelText: { color: '#4A90D9', fontSize: 16 },
  modalBody: { flex: 1, padding: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  typeBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: '#fff' },
  typeBtnSelected: { borderColor: '#4A90D9', backgroundColor: '#4A90D9' + '18' },
  typeBtnText: { fontSize: 13, color: '#666', fontWeight: '500' },
  typeBtnTextSelected: { color: '#4A90D9' },
});
