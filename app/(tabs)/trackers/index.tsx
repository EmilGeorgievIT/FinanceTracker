import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, SectionList, Modal, Alert,
  StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useCreateSavingsGoal, useCreateIncomeTracker, useCreateExpenseTracker,
  useCreateMortgage, useCreateLoan, useCreateVariableHolding,
  useDeleteTracker,
} from '../../../src/hooks/useTrackers';
import { useCategories } from '../../../src/hooks/useCategories';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Card } from '../../../src/components/ui/Card';
import { useTheme, useT } from '../../../src/stores/useUiStore';
import { formatEur } from '../../../src/utils/currency';
import * as repo from '../../../src/repositories/trackerRepository';
import type { TrackerRow } from '../../../src/repositories/trackerRepository';
import type { TrackerType } from '../../../src/types/enums';

type FilterKey = 'all' | 'assets' | 'debts' | 'income' | 'expenses';

const FILTERS: { key: FilterKey; labelKey: string }[] = [
  { key: 'all', labelKey: 'all' },
  { key: 'assets', labelKey: 'assets' },
  { key: 'debts', labelKey: 'debts' },
  { key: 'income', labelKey: 'income' },
  { key: 'expenses', labelKey: 'expenses' },
];

function trackerGroup(tracker: TrackerRow): string {
  if (tracker.type === 'savings_goal' || tracker.type === 'variable_holding') return 'assets';
  if (tracker.type === 'mortgage' || tracker.type === 'loan') return 'debts';
  if (tracker.type === 'income') return 'income';
  return 'expenses';
}

const TRACKER_TYPE_OPTIONS: { key: TrackerType; labelKey: string }[] = [
  { key: 'savings_goal', labelKey: 'savingsGoal' },
  { key: 'variable_holding', labelKey: 'variableHolding' },
  { key: 'mortgage', labelKey: 'mortgage' },
  { key: 'loan', labelKey: 'loan' },
  { key: 'income', labelKey: 'income' },
  { key: 'expense', labelKey: 'expenses' },
];

interface Section {
  title: string;
  data: TrackerRow[];
}

export default function TrackersScreen() {
  const theme = useTheme();
  const t = useT();
  const [trackers, setTrackers] = useState<TrackerRow[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const deleteTracker = useDeleteTracker();
  const createSavingsGoal = useCreateSavingsGoal();
  const createIncome = useCreateIncomeTracker();
  const createExpense = useCreateExpenseTracker();
  const createMortgage = useCreateMortgage();
  const createLoan = useCreateLoan();
  const createHolding = useCreateVariableHolding();
  const { categories } = useCategories();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<TrackerType>('savings_goal');

  const doRefresh = useCallback(async () => {
    const data = await repo.getAllTrackers();
    setTrackers(data);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { doRefresh(); }, [doRefresh]));

  const getVisible = () => {
    let items = trackers;
    if (filter === 'assets') items = items.filter((t) => t.type === 'savings_goal' || t.type === 'variable_holding');
    else if (filter === 'debts') items = items.filter((t) => t.type === 'mortgage' || t.type === 'loan');
    else if (filter === 'income') items = items.filter((t) => t.type === 'income');
    else if (filter === 'expenses') items = items.filter((t) => t.type === 'expense');

    const groups = new Map<string, TrackerRow[]>();
    for (const t of items) {
      const g = trackerGroup(t);
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(t);
    }
    return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
  };

  // Form state
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
    doRefresh();
  };

  const renderTracker = ({ item }: { item: TrackerRow }) => (
    <TrackerListItem
      tracker={item}
      onPress={() => router.push(`/trackers/${item.id}`)}
      onDelete={async () => { await deleteTracker(item.id); doRefresh(); }}
    />
  );

  const renderSection = ({ section }: { section: Section }) => (
    <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 16, marginBottom: 8 }]}>
      {t(section.title as any).toUpperCase()}
    </Text>
  );

  const sections = getVisible();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, { backgroundColor: filter === f.key ? theme.primary : theme.surface, borderColor: filter === f.key ? theme.primary : theme.border }]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.chipText, { color: filter === f.key ? '#fff' : theme.textSecondary }]}>{t(f.labelKey as any)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTracker}
        renderSectionHeader={renderSection}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={!loading ? <Text style={[styles.empty, { color: theme.textTertiary }]}>{t('noTrackers')}</Text> : null}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.fab }]} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Create Modal — same as before but keeping it compact */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={[styles.modalContainer, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
              <Text style={[styles.cancelText, { color: theme.primary }]}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('newTracker')}</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('type')}</Text>
            <View style={styles.typeRow}>
              {TRACKER_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.typeBtn, { borderColor: theme.border, backgroundColor: theme.inputBg }, selectedType === opt.key && { borderColor: theme.primary, backgroundColor: theme.primary + '18' }]}
                  onPress={() => setSelectedType(opt.key)}
                >
                  <Text style={[styles.typeBtnText, { color: theme.textSecondary }, selectedType === opt.key && { color: theme.primary }]}>{t(opt.labelKey as any)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label={t('name')} placeholder={t('trackerName')} value={fName} onChangeText={setFName} />
            {selectedType === 'savings_goal' && (<>
              <Input label="Target Amount (EUR)" keyboardType="decimal-pad" value={fTarget} onChangeText={setFTarget} />
              <Input label="Monthly Contribution (EUR)" keyboardType="decimal-pad" value={fMonthly} onChangeText={setFMonthly} />
              <Input label="Priority (0 = highest)" keyboardType="number-pad" value={fPriority} onChangeText={setFPriority} />
            </>)}
            {selectedType === 'income' && (<>
              <Input label="Net Monthly Amount (EUR)" keyboardType="decimal-pad" value={fIncomeAmt} onChangeText={setFIncomeAmt} />
              <Input label="Payment Day (1-31)" keyboardType="number-pad" value={fPayDay} onChangeText={setFPayDay} />
            </>)}
            {selectedType === 'expense' && (<>
              <Input label="Amount (EUR)" keyboardType="decimal-pad" value={fExpAmt} onChangeText={setFExpAmt} />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('frequency')}</Text>
              <View style={styles.typeRow}>
                {(['monthly', 'one_off'] as const).map((f) => (
                  <TouchableOpacity key={f} style={[styles.typeBtn, { borderColor: theme.border, backgroundColor: theme.inputBg }, fExpFreq === f && { borderColor: theme.primary, backgroundColor: theme.primary + '18' }]} onPress={() => setFExpFreq(f)}>
                    <Text style={[styles.typeBtnText, { color: theme.textSecondary }, fExpFreq === f && { color: theme.primary }]}>{f === 'monthly' ? 'Monthly' : 'One-off'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input label={fExpFreq === 'monthly' ? 'Day of Month' : 'Date'} keyboardType="number-pad" value={fExpDay} onChangeText={setFExpDay} />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('categories')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {categories.map((cat) => (
                    <TouchableOpacity key={cat.id} style={[styles.typeBtn, { borderColor: theme.border, backgroundColor: theme.inputBg }, fExpCat === cat.id && { borderColor: theme.primary, backgroundColor: theme.primary + '18' }]} onPress={() => setFExpCat(cat.id)}>
                      <Text style={[styles.typeBtnText, { color: theme.textSecondary }, fExpCat === cat.id && { color: theme.primary }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </>)}
            {(selectedType === 'mortgage' || selectedType === 'loan') && (<>
              <Input label="Original Principal (EUR)" keyboardType="decimal-pad" value={fPrincipal} onChangeText={setFPrincipal} />
              <Input label="Current Balance (EUR)" keyboardType="decimal-pad" value={fBalance} onChangeText={setFBalance} />
              <Input label="Annual Interest Rate (%)" keyboardType="decimal-pad" value={fRate} onChangeText={setFRate} />
              <Input label="Monthly Payment (EUR)" keyboardType="decimal-pad" value={fPayment} onChangeText={setFPayment} />
              {selectedType === 'mortgage' && <Input label="Property Value (EUR)" keyboardType="decimal-pad" value={fPropValue} onChangeText={setFPropValue} />}
            </>)}
            {selectedType === 'variable_holding' && (<>
              <Input label="Ticker Symbol" placeholder="e.g. BTC-USD, AAPL" value={fTicker} onChangeText={setFTicker} autoCapitalize="characters" />
              <Input label="Units Held" keyboardType="decimal-pad" value={fUnits} onChangeText={setFUnits} />
              <Input label="Avg Purchase Price (EUR)" keyboardType="decimal-pad" value={fAvgPrice} onChangeText={setFAvgPrice} />
            </>)}
            <Button title={`Create ${TRACKER_TYPE_OPTIONS.find((t) => t.key === selectedType)?.label ?? ''}`} onPress={handleAdd} style={{ marginTop: 12 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// Inline tracker list item with subtitle metrics
const TYPE_COLORS: Record<string, string> = {
  savings_goal: '#27ae60', variable_holding: '#8e44ad',
  mortgage: '#e74c3c', loan: '#e67e22',
  income: '#2ecc71', expense: '#c0392b',
};
const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  savings_goal: 'flag-outline', variable_holding: 'bar-chart-outline',
  mortgage: 'home-outline', loan: 'car-outline',
  income: 'cash-outline', expense: 'card-outline',
};

function TrackerListItem({ tracker, onPress, onDelete }: { tracker: TrackerRow; onPress: () => void; onDelete: () => void }) {
  const theme = useTheme();
  const t = useT();
  const color = TYPE_COLORS[tracker.type] ?? '#999';
  const icon = TYPE_ICONS[tracker.type] ?? 'wallet-outline';
  const [subtitle, setSubtitle] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (tracker.type === 'savings_goal') {
          const sg = await repo.getSavingsGoalByTrackerId(tracker.id);
          if (sg) setSubtitle(`${formatEur(sg.currentBalance)} of ${formatEur(sg.targetAmount)} · ${Math.round(sg.currentBalance / sg.targetAmount * 100)}%`);
        } else if (tracker.type === 'income') {
          const inc = await repo.getIncomeTrackerByTrackerId(tracker.id);
          if (inc) setSubtitle(`${formatEur(inc.netMonthlyAmount)}/mo · Day ${inc.paymentDay}`);
        } else if (tracker.type === 'expense') {
          const exp = await repo.getExpenseTrackerByTrackerId(tracker.id);
          if (exp) setSubtitle(`${formatEur(exp.amount)} · ${exp.frequency === 'monthly' ? 'Monthly' : 'One-off'}`);
        } else if (tracker.type === 'mortgage' || tracker.type === 'loan') {
          const m = tracker.type === 'mortgage' ? await repo.getMortgageByTrackerId(tracker.id) : await repo.getLoanByTrackerId(tracker.id);
          if (m) setSubtitle(`${formatEur(m.balance)} remaining · ${m.interestRate}%`);
        } else if (tracker.type === 'variable_holding') {
          const vh = await repo.getVariableHoldingByTrackerId(tracker.id);
          if (vh) {
            const price = vh.currentPrice ?? vh.avgPurchasePrice;
            const val = vh.units * price;
            const pnl = val - vh.units * vh.avgPurchasePrice;
            setSubtitle(`${vh.units} units · ${formatEur(val)} · ${pnl >= 0 ? '+' : ''}${formatEur(pnl)}`);
          }
        }
      } catch { /* ignore */ }
    })();
  }, [tracker]);

  const handleLongPress = () => {
    Alert.alert(t('deleteTracker'), t('deleteConfirm', { name: tracker.name }), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity onPress={onPress} onLongPress={handleLongPress} activeOpacity={0.7}>
      <Card style={{ marginBottom: 8, paddingVertical: 14, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[{ width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: color + '18', marginRight: 12 }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>{tracker.name}</Text>
            {subtitle && <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{subtitle}</Text>}
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterScroll: { marginTop: 8, marginBottom: 4, maxHeight: 44 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  empty: { textAlign: 'center', fontSize: 15, marginTop: 40 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 6 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  cancelText: { fontSize: 16 },
  modalBody: { flex: 1, padding: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  typeBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14 },
  typeBtnText: { fontSize: 13, fontWeight: '500' },
});
