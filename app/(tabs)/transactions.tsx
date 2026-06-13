import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/stores/useUiStore';
import { getAllTransactions, type TransactionRow } from '../../src/repositories/transactionRepository';
import { Card } from '../../src/components/ui/Card';
import { formatEur } from '../../src/utils/currency';
import { formatDate } from '../../src/utils/date';

const TYPE_LABELS: Record<string, string> = {
  deposit: 'Deposit',
  payment: 'Payment',
  buy: 'Buy',
  sell: 'Sell',
  balance_adjustment: 'Adjustment',
};

export default function TransactionsScreen() {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getAllTransactions().then((data) => {
        setTransactions(data);
        setLoading(false);
      });
    }, [])
  );

  const renderItem = ({ item }: { item: TransactionRow }) => {
    const isPositive = item.type === 'deposit' || item.type === 'buy';
    return (
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.left}>
            <Text style={[styles.type, { color: theme.text }]}>
              {TYPE_LABELS[item.type] ?? item.type}
            </Text>
            {item.note ? <Text style={[styles.note, { color: theme.textSecondary }]}>{item.note}</Text> : null}
            <Text style={[styles.date, { color: theme.textTertiary }]}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text style={[styles.amount, { color: isPositive ? theme.success : theme.danger }]}>
            {isPositive ? '+' : '-'}{formatEur(item.amount)}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {loading ? (
        <Text style={[styles.empty, { color: theme.textTertiary }]}>Loading…</Text>
      ) : transactions.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textTertiary }]}>No transactions yet</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  empty: { textAlign: 'center', fontSize: 15, marginTop: 40 },
  card: { marginBottom: 8, paddingVertical: 12, paddingHorizontal: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flex: 1 },
  type: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  note: { fontSize: 12, marginTop: 2 },
  date: { fontSize: 11, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '700' },
});
