import { useState } from 'react';
import {
  View, Text, FlatList, Modal, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTrackerWithTransactions } from '../../../src/hooks/useTrackers';
import { useTransactions, useAddTransaction } from '../../../src/hooks/useTransactions';
import { usePriceRefresh } from '../../../src/hooks/usePriceRefresh';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Card } from '../../../src/components/ui/Card';
import { formatEur } from '../../../src/utils/currency';
import { formatDate } from '../../../src/utils/date';
import type { TransactionRow } from '../../../src/repositories/transactionRepository';
import type { TransactionType } from '../../../src/types/enums';

export default function TrackerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trackerId = parseInt(id, 10);
  const { tracker, savingsGoal, incomeTracker, expenseTracker, mortgage, loan, variableHolding, loading, refresh } =
    useTrackerWithTransactions(trackerId);
  const { transactions, loading: txLoading, refresh: refreshTx } = useTransactions(trackerId);
  const addTransaction = useAddTransaction();
  const { refreshing: priceRefreshing, refreshAll: refreshPrices } = usePriceRefresh();
  const [modalVisible, setModalVisible] = useState(false);
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');
  const [txType, setTxType] = useState<TransactionType>('deposit');
  const [txUnits, setTxUnits] = useState('');
  const [txPrice, setTxPrice] = useState('');

  const getTransactionTypes = (): { key: TransactionType; label: string }[] => {
    if (savingsGoal) return [{ key: 'deposit', label: 'Deposit' }];
    if (mortgage || loan) return [{ key: 'payment', label: 'Payment' }];
    if (variableHolding) return [
      { key: 'buy', label: 'Buy' },
      { key: 'sell', label: 'Sell' },
    ];
    return [{ key: 'deposit', label: 'Deposit' }];
  };

  const handleAddTx = async () => {
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) return;

    await addTransaction({
      trackerId,
      type: txType,
      amount,
      units: txUnits ? parseFloat(txUnits) : undefined,
      pricePerUnit: txPrice ? parseFloat(txPrice) : undefined,
      note: txNote.trim() || undefined,
    });

    setTxAmount('');
    setTxNote('');
    setTxUnits('');
    setTxPrice('');
    setModalVisible(false);
    refresh();
    refreshTx();
  };

  if (loading) {
    return <View style={styles.centered}><Text style={styles.loadingText}>Loading…</Text></View>;
  }
  if (!tracker) {
    return <View style={styles.centered}><Text style={styles.loadingText}>Tracker not found</Text></View>;
  }

  const txTypes = getTransactionTypes();

  const renderTransaction = ({ item }: { item: TransactionRow }) => {
    const isPositive = item.type === 'deposit' || item.type === 'buy';
    return (
      <Card style={styles.txCard}>
        <View style={styles.txLeft}>
          <Text style={styles.txType}>{item.type}</Text>
          {item.note ? <Text style={styles.txNote}>{item.note}</Text> : null}
          <Text style={styles.txDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={[styles.txAmount, isPositive ? styles.txPositive : styles.txNegative]}>
          {isPositive ? '+' : '-'}{formatEur(item.amount)}
        </Text>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Savings Goal */}
        {savingsGoal && (
          <Card style={styles.detailCard}>
            <Text style={styles.cardTitle}>{tracker.name}</Text>
            <ProgressBar current={savingsGoal.currentBalance} target={savingsGoal.targetAmount} />
            <Row label="Current" value={formatEur(savingsGoal.currentBalance)} />
            <Row label="Target" value={formatEur(savingsGoal.targetAmount)} />
            <Row label="Monthly" value={formatEur(savingsGoal.monthlyContribution)} />
            <Row label="Remaining" value={formatEur(savingsGoal.targetAmount - savingsGoal.currentBalance)} />
          </Card>
        )}

        {/* Income */}
        {incomeTracker && (
          <Card style={styles.detailCard}>
            <Text style={styles.cardTitle}>{tracker.name}</Text>
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Text style={styles.bigAmount}>{formatEur(incomeTracker.netMonthlyAmount)}</Text>
              <Text style={styles.subtext}>Net monthly income — day {incomeTracker.paymentDay}</Text>
            </View>
            <Row label="Annual" value={formatEur(incomeTracker.netMonthlyAmount * 12)} />
          </Card>
        )}

        {/* Expense */}
        {expenseTracker && (
          <Card style={styles.detailCard}>
            <Text style={styles.cardTitle}>{tracker.name}</Text>
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Text style={[styles.bigAmount, { color: '#c0392b' }]}>{formatEur(expenseTracker.amount)}</Text>
              <Text style={styles.subtext}>{expenseTracker.frequency === 'monthly' ? 'Monthly' : 'One-off'} expense</Text>
            </View>
          </Card>
        )}

        {/* Mortgage */}
        {mortgage && (
          <Card style={styles.detailCard}>
            <Text style={styles.cardTitle}>{tracker.name}</Text>
            <ProgressBar current={mortgage.balance} target={mortgage.principal} color="#e74c3c" />
            <Row label="Balance" value={formatEur(mortgage.balance)} />
            <Row label="Original" value={formatEur(mortgage.principal)} />
            <Row label="Rate" value={`${mortgage.interestRate}%`} />
            <Row label="Monthly Payment" value={formatEur(mortgage.monthlyPayment)} />
            <Row label="Property Value" value={formatEur(mortgage.propertyValue)} />
            <Row label="Paid off" value={`${Math.round((1 - mortgage.balance / mortgage.principal) * 100)}%`} />
          </Card>
        )}

        {/* Loan */}
        {loan && (
          <Card style={styles.detailCard}>
            <Text style={styles.cardTitle}>{tracker.name}</Text>
            <ProgressBar current={loan.balance} target={loan.principal} color="#e67e22" />
            <Row label="Balance" value={formatEur(loan.balance)} />
            <Row label="Original" value={formatEur(loan.principal)} />
            <Row label="Rate" value={`${loan.interestRate}%`} />
            <Row label="Monthly Payment" value={formatEur(loan.monthlyPayment)} />
            <Row label="Paid off" value={`${Math.round((1 - loan.balance / loan.principal) * 100)}%`} />
          </Card>
        )}

        {/* Variable Holding */}
        {variableHolding && (
          <Card style={styles.detailCard}>
            <Text style={styles.cardTitle}>{tracker.name}</Text>
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={styles.bigAmount}>
                {variableHolding.currentPrice ? formatEur(variableHolding.currentPrice) : 'N/A'}
              </Text>
              <Text style={styles.subtext}>
                {variableHolding.currentPrice ? 'Current price' : 'Price not fetched'}
              </Text>
            </View>
            <Row label="Units" value={String(variableHolding.units)} />
            <Row label="Avg Cost" value={formatEur(variableHolding.avgPurchasePrice)} />
            {variableHolding.currentPrice && (
              <>
                <Row
                  label="Total Value"
                  value={formatEur(variableHolding.units * variableHolding.currentPrice)}
                />
                <Row
                  label="P&L"
                  value={formatEur(
                    variableHolding.units * (variableHolding.currentPrice - variableHolding.avgPurchasePrice)
                  )}
                />
                <Row
                  label="P&L %"
                  value={`${((variableHolding.currentPrice / variableHolding.avgPurchasePrice - 1) * 100).toFixed(2)}%`}
                />
              </>
            )}
            <Button
              title={priceRefreshing ? 'Refreshing…' : 'Refresh Price'}
              variant="secondary"
              onPress={async () => { await refreshPrices(); refresh(); }}
              style={{ marginTop: 12 }}
            />
          </Card>
        )}

        {/* Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <Button title="+ Add" variant="primary" onPress={() => { setTxType(txTypes[0]?.key ?? 'deposit'); setModalVisible(true); }} style={{ paddingVertical: 8, paddingHorizontal: 14 }} />
        </View>

        {txLoading ? (
          <Text style={styles.emptyText}>Loading…</Text>
        ) : transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={{ paddingHorizontal: 16, marginBottom: 6 }}>
              {renderTransaction({ item: tx })}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.typeRow}>
              {txTypes.map((t) => (
                <TouchableOpacity key={t.key} style={[styles.typeBtn, txType === t.key && styles.typeBtnSelected]} onPress={() => setTxType(t.key)}>
                  <Text style={[styles.typeBtnText, txType === t.key && styles.typeBtnTextSelected]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Amount (EUR)" keyboardType="decimal-pad" value={txAmount} onChangeText={setTxAmount} autoFocus />
            {(txType === 'buy' || txType === 'sell') && (
              <>
                <Input label="Units" keyboardType="decimal-pad" value={txUnits} onChangeText={setTxUnits} />
                <Input label="Price per Unit (EUR)" keyboardType="decimal-pad" value={txPrice} onChangeText={setTxPrice} />
              </>
            )}
            <Input label="Note (optional)" value={txNote} onChangeText={setTxNote} />
            <Button title={`Add ${txType}`} onPress={handleAddTx} style={{ marginTop: 12 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function ProgressBar({ current, target, color = '#27ae60' }: { current: number; target: number; color?: string }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <View style={{ flex: 1, height: 14, backgroundColor: '#e9ecef', borderRadius: 7, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 7 }} />
      </View>
      <Text style={{ fontSize: 14, fontWeight: '700', color, width: 44, textAlign: 'right' }}>{pct}%</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 13, color: '#888' }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#222' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { color: '#999', fontSize: 16 },
  detailCard: { margin: 16, marginBottom: 8, padding: 16 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 14 },
  bigAmount: { fontSize: 36, fontWeight: '700', color: '#2ecc71' },
  subtext: { fontSize: 13, color: '#888', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  txCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingVertical: 12, paddingHorizontal: 14 },
  txLeft: { flex: 1 },
  txType: { fontSize: 14, fontWeight: '600', color: '#222', textTransform: 'capitalize' },
  txNote: { fontSize: 12, color: '#888', marginTop: 2 },
  txDate: { fontSize: 11, color: '#aaa', marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '700' },
  txPositive: { color: '#27ae60' },
  txNegative: { color: '#c0392b' },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 14, marginTop: 24 },
  modalContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  cancelText: { color: '#4A90D9', fontSize: 16 },
  modalBody: { flex: 1, padding: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  typeBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: '#fff' },
  typeBtnSelected: { borderColor: '#4A90D9', backgroundColor: '#4A90D9' + '18' },
  typeBtnText: { fontSize: 13, color: '#666', fontWeight: '500' },
  typeBtnTextSelected: { color: '#4A90D9' },
});
