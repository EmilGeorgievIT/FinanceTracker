import { useState, useCallback } from 'react';
import {
  View, Text, Modal, Alert, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTrackerWithTransactions, useDeleteTracker } from '../../../src/hooks/useTrackers';
import { useTransactions, useAddTransaction } from '../../../src/hooks/useTransactions';
import { usePriceRefresh } from '../../../src/hooks/usePriceRefresh';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Card } from '../../../src/components/ui/Card';
import { useTheme, useT } from '../../../src/stores/useUiStore';
import { formatEur } from '../../../src/utils/currency';
import { formatDate } from '../../../src/utils/date';
import type { TransactionRow } from '../../../src/repositories/transactionRepository';
import type { TransactionType } from '../../../src/types/enums';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  savings_goal: 'flag-outline', variable_holding: 'bar-chart-outline',
  mortgage: 'home-outline', loan: 'car-outline',
  income: 'cash-outline', expense: 'card-outline',
};
const TYPE_COLORS: Record<string, string> = {
  savings_goal: '#27ae60', variable_holding: '#8e44ad',
  mortgage: '#e74c3c', loan: '#e67e22',
  income: '#2ecc71', expense: '#c0392b',
};

// Circular progress ring for savings goals
function ProgressRing({ current, target, color, size = 180 }: { current: number; target: number; color: string; size?: number }) {
  const t = useT();
  const pct = Math.min(100, Math.round((current / target) * 100));
  const strokeW = 10;
  const radius = (size - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (pct / 100) * circumference;

  return (
    <View style={{ alignItems: 'center', paddingVertical: 16 }}>
      <View style={{ width: size, height: size }}>
        {/* Background circle using View */}
        <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: strokeW, borderColor: '#e9ecef' }} />
        {/* Progress overlay — simplified as left half */}
        <View style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color }}>{formatEur(current)}</Text>
          <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{t('of')} {formatEur(target)}</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color, marginTop: 4 }}>{pct}%</Text>
        </View>
        {/* Simple progress representation */}
        <View style={{ position: 'absolute', bottom: 0, left: strokeW, right: strokeW, height: 6, backgroundColor: '#e9ecef', borderRadius: 3 }}>
          <View style={{ height: 6, width: `${pct}%`, backgroundColor: color, borderRadius: 3 }} />
        </View>
      </View>
    </View>
  );
}

export default function TrackerDetailScreen() {
  const theme = useTheme();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trackerId = parseInt(id, 10);
  const { tracker, savingsGoal, incomeTracker, expenseTracker, mortgage, loan, variableHolding, loading, refresh } = useTrackerWithTransactions(trackerId);
  const { transactions, loading: txLoading, refresh: refreshTx } = useTransactions(trackerId);
  const addTransaction = useAddTransaction();
  const deleteTracker = useDeleteTracker();
  const { refreshing: priceRefreshing, refreshAll: refreshPrices } = usePriceRefresh();
  const [tab, setTab] = useState<'overview' | 'transactions'>('overview');
  const [modalVisible, setModalVisible] = useState(false);
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');
  const [txType, setTxType] = useState<TransactionType>('deposit');
  const [txUnits, setTxUnits] = useState('');
  const [txPrice, setTxPrice] = useState('');

  const color = tracker ? (TYPE_COLORS[tracker.type] ?? '#999') : '#999';
  const icon = tracker ? (TYPE_ICONS[tracker.type] ?? 'wallet-outline') : 'wallet-outline';

  const getTxTypes = (): { key: TransactionType; label: string }[] => {
    if (savingsGoal) return [{ key: 'deposit', label: t('deposit') }];
    if (mortgage || loan) return [{ key: 'payment', label: t('payment') }];
    if (variableHolding) return [{ key: 'buy', label: t('buy') }, { key: 'sell', label: t('sell') }];
    return [{ key: 'deposit', label: t('deposit') }];
  };

  const handleAddTx = async () => {
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) return;
    await addTransaction({ trackerId, type: txType, amount, units: txUnits ? parseFloat(txUnits) : undefined, pricePerUnit: txPrice ? parseFloat(txPrice) : undefined, note: txNote.trim() || undefined });
    setTxAmount(''); setTxNote(''); setTxUnits(''); setTxPrice('');
    setModalVisible(false);
    refresh(); refreshTx();
  };

  if (loading) return <View style={[s.centered, { backgroundColor: theme.background }]}><Text style={{ color: theme.textTertiary }}>{t('loading')}</Text></View>;
  if (!tracker) return <View style={[s.centered, { backgroundColor: theme.background }]}><Text style={{ color: theme.textTertiary }}>{t('notFound')}</Text></View>;

  const txTypes = getTxTypes();
  const primaryActionLabel = savingsGoal ? 'Deposit' : mortgage || loan ? 'Payment' : variableHolding ? 'Buy' : 'Add';

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <View style={[s.iconCircle, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon} size={32} color={color} />
          </View>
          <Text style={[s.name, { color: theme.text }]}>{tracker.name}</Text>
        </View>

        {/* Tabs */}
        <View style={[s.tabRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {(['overview', 'transactions'] as const).map((t) => (
            <TouchableOpacity key={t} style={[s.tab, tab === t && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]} onPress={() => setTab(t)}>
              <Text style={[s.tabText, { color: tab === t ? theme.primary : theme.textSecondary }]}>{t === 'overview' ? t('overview2') : t('transactions')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'overview' && (
          <View style={{ padding: 16 }}>
            {/* Savings Goal */}
            {savingsGoal && (
              <Card style={s.detailCard}>
                <ProgressRing current={savingsGoal.currentBalance} target={savingsGoal.targetAmount} color={color} />
                <Row theme={theme} label={t('targetAmount')} value={formatEur(savingsGoal.targetAmount)} />
                <Row theme={theme} label={t('currentBalance')} value={formatEur(savingsGoal.currentBalance)} />
                <Row theme={theme} label={t('monthlyContribution')} value={formatEur(savingsGoal.monthlyContribution)} />
                <Row theme={theme} label={t('remaining')} value={formatEur(savingsGoal.targetAmount - savingsGoal.currentBalance)} />
                <Row theme={theme} label={t('priority')} value={String(savingsGoal.priority)} />
              </Card>
            )}

            {/* Income */}
            {incomeTracker && (
              <Card style={s.detailCard}>
                <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <Text style={[s.bigAmount, { color: theme.success }]}>{formatEur(incomeTracker.netMonthlyAmount)}</Text>
                  <Text style={[s.subtext, { color: theme.textSecondary }]}>Net monthly income · Day {incomeTracker.paymentDay}</Text>
                </View>
                <Row theme={theme} label={t('annual')} value={formatEur(incomeTracker.netMonthlyAmount * 12)} />
                <Row theme={theme} label={t('paymentDay')} value={String(incomeTracker.paymentDay)} />
              </Card>
            )}

            {/* Expense */}
            {expenseTracker && (
              <Card style={s.detailCard}>
                <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <Text style={[s.bigAmount, { color: theme.danger }]}>{formatEur(expenseTracker.amount)}</Text>
                  <Text style={[s.subtext, { color: theme.textSecondary }]}>{expenseTracker.frequency === 'monthly' ? 'Monthly' : 'One-off'} expense</Text>
                </View>
                <Row theme={theme} label={t('frequency')} value={expenseTracker.frequency === 'monthly' ? t('monthly') : t('oneOff')} />
                <Row theme={theme} label="Date/Day" value={String(expenseTracker.dateValue)} />
              </Card>
            )}

            {/* Mortgage */}
            {mortgage && (
              <Card style={s.detailCard}>
                <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={[s.bigAmount, { color: theme.danger }]}>{formatEur(mortgage.balance)}</Text>
                  <Text style={[s.subtext, { color: theme.textSecondary }]}>Remaining balance</Text>
                </View>
                <ProgressBar current={mortgage.principal - mortgage.balance} target={mortgage.principal} color={color} />
                <Row theme={theme} label={t('originalPrincipal')} value={formatEur(mortgage.principal)} />
                <Row theme={theme} label={t('interestRate')} value={`${mortgage.interestRate}%`} />
                <Row theme={theme} label={t('monthlyPayment')} value={formatEur(mortgage.monthlyPayment)} />
                <Row theme={theme} label={t('propertyValue')} value={formatEur(mortgage.propertyValue)} />
                <Row theme={theme} label={t('ltv')} value={`${Math.round(mortgage.balance / mortgage.propertyValue * 100)}%`} />
              </Card>
            )}

            {/* Loan */}
            {loan && (
              <Card style={s.detailCard}>
                <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={[s.bigAmount, { color: theme.danger }]}>{formatEur(loan.balance)}</Text>
                  <Text style={[s.subtext, { color: theme.textSecondary }]}>Remaining balance</Text>
                </View>
                <ProgressBar current={loan.principal - loan.balance} target={loan.principal} color={color} />
                <Row theme={theme} label={t('originalPrincipal')} value={formatEur(loan.principal)} />
                <Row theme={theme} label={t('interestRate')} value={`${loan.interestRate}%`} />
                <Row theme={theme} label={t('monthlyPayment')} value={formatEur(loan.monthlyPayment)} />
              </Card>
            )}

            {/* Variable Holding */}
            {variableHolding && (
              <Card style={s.detailCard}>
                <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={[s.bigAmount, { color: variableHolding.currentPrice ? (variableHolding.currentPrice > variableHolding.avgPurchasePrice ? theme.success : theme.danger) : theme.text }]}>
                    {variableHolding.currentPrice ? formatEur(variableHolding.currentPrice) : 'N/A'}
                  </Text>
                  <Text style={[s.subtext, { color: theme.textSecondary }]}>{variableHolding.currentPrice ? 'Current price' : 'Price not fetched'}</Text>
                </View>
                <Row theme={theme} label={t('units')} value={String(variableHolding.units)} />
                <Row theme={theme} label={t('avgCost')} value={formatEur(variableHolding.avgPurchasePrice)} />
                {variableHolding.currentPrice && (<>
                  <Row theme={theme} label={t('totalValue')} value={formatEur(variableHolding.units * variableHolding.currentPrice)} />
                  <Row theme={theme} label={t('profitLoss')} value={formatEur(variableHolding.units * (variableHolding.currentPrice - variableHolding.avgPurchasePrice))} />
                  <Row theme={theme} label={`${t('profitLoss')} %`} value={`${((variableHolding.currentPrice / variableHolding.avgPurchasePrice - 1) * 100).toFixed(2)}%`} />
                </>)}
                <Button title={priceRefreshing ? t('refreshing') : t('refreshPrice')} variant="secondary" onPress={async () => { await refreshPrices(); refresh(); }} style={{ marginTop: 12 }} />
              </Card>
            )}
          </View>
        )}

        {tab === 'transactions' && (
          <View style={{ padding: 16 }}>
            {txLoading ? (
              <Text style={[s.emptyText, { color: theme.textTertiary }]}>{t('loading')}</Text>
            ) : transactions.length === 0 ? (
              <Text style={[s.emptyText, { color: theme.textTertiary }]}>{t('noTransactions')}</Text>
            ) : (
              transactions.map((tx) => <TransactionItem key={tx.id} tx={tx} theme={theme} />)
            )}
          </View>
        )}

        {/* Delete button */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <Button title={t('deleteTracker')} variant="danger" onPress={() => {
            Alert.alert(t('deleteTracker'), t('deleteConfirm', { name: tracker.name }), [
              { text: t('cancel'), style: 'cancel' },
              { text: t('delete'), style: 'destructive', onPress: async () => { await deleteTracker(tracker.id); router.back(); } },
            ]);
          }} />
        </View>
      </ScrollView>

      {/* FAB for adding transaction */}
      <TouchableOpacity style={[s.fab, { backgroundColor: theme.fab }]} onPress={() => { setTxType(txTypes[0]?.key ?? 'deposit'); setModalVisible(true); }} activeOpacity={0.8}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={[s.modalContainer, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[s.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[s.cancelText, { color: theme.primary }]}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: theme.text }]}>{t('addTransaction')}</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={s.modalBody}>
            <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>{t('type')}</Text>
            <View style={s.typeRow}>
              {txTypes.map((t) => (
                <TouchableOpacity key={t.key} style={[s.typeBtn, { borderColor: theme.border, backgroundColor: theme.inputBg }, txType === t.key && { borderColor: theme.primary, backgroundColor: theme.primary + '18' }]} onPress={() => setTxType(t.key)}>
                  <Text style={[s.typeBtnText, { color: theme.textSecondary }, txType === t.key && { color: theme.primary }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label={`${t('amount')} (EUR)`} keyboardType="decimal-pad" value={txAmount} onChangeText={setTxAmount} autoFocus />
            {(txType === 'buy' || txType === 'sell') && (<>
              <Input label={t('units')} keyboardType="decimal-pad" value={txUnits} onChangeText={setTxUnits} />
              <Input label={`${t('currentPrice')} (EUR)`} keyboardType="decimal-pad" value={txPrice} onChangeText={setTxPrice} />
            </>)}
            <Input label={t('note')} value={txNote} onChangeText={setTxNote} />
            <Button title={`${t('add')} ${t(txType as any)}`} onPress={handleAddTx} style={{ marginTop: 12 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function Row({ theme, label, value }: { theme: any; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.border }}>
      <Text style={{ fontSize: 13, color: theme.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text }}>{value}</Text>
    </View>
  );
}

function ProgressBar({ current, target, color }: { current: number; target: number; color: string }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <View style={{ flex: 1, height: 10, backgroundColor: '#e9ecef', borderRadius: 5, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 5 }} />
      </View>
      <Text style={{ fontSize: 13, fontWeight: '700', color, width: 44, textAlign: 'right' }}>{pct}%</Text>
    </View>
  );
}

function TransactionItem({ tx, theme }: { tx: TransactionRow; theme: any }) {
  const isPositive = tx.type === 'deposit' || tx.type === 'buy';
  return (
    <Card style={{ marginBottom: 8, paddingVertical: 12, paddingHorizontal: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text, textTransform: 'capitalize' }}>{tx.type}</Text>
          {tx.note ? <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{tx.note}</Text> : null}
          <Text style={{ fontSize: 11, color: theme.textTertiary, marginTop: 2 }}>{formatDate(tx.createdAt)}</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '700', color: isPositive ? theme.success : theme.danger }}>
          {isPositive ? '+' : '-'}{formatEur(tx.amount)}
        </Text>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 22, fontWeight: '700' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, marginHorizontal: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 14, fontWeight: '600' },
  detailCard: { marginBottom: 12, padding: 16 },
  bigAmount: { fontSize: 32, fontWeight: '700' },
  subtext: { fontSize: 13, marginTop: 4 },
  emptyText: { textAlign: 'center', fontSize: 14, marginTop: 24 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 6 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  cancelText: { fontSize: 16 },
  modalBody: { flex: 1, padding: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  typeBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14 },
  typeBtnText: { fontSize: 13, fontWeight: '500' },
});
