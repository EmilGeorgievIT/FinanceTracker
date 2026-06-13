import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useDashboardData } from '../../src/hooks/useDashboardData';
import { usePriceRefresh } from '../../src/hooks/usePriceRefresh';
import { SummaryCards, AllocationPie, IncomeExpenseBar } from '../../src/components/charts/DashboardCharts';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/stores/useUiStore';

export default function HomeScreen() {
  const theme = useTheme();
  const { summary, loading, refresh } = useDashboardData();
  const { refreshing: priceRefreshing, refreshAll } = usePriceRefresh();

  const handleRefreshPrices = async () => {
    await refreshAll();
    refresh();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.greeting, { color: theme.text }]}>Finance Tracker</Text>

      <View style={styles.row}>
        <Button
          title={priceRefreshing ? 'Refreshing…' : 'Refresh Prices'}
          variant="secondary"
          onPress={handleRefreshPrices}
          style={{ flex: 1, paddingVertical: 10 }}
        />
      </View>

      {loading ? (
        <Text style={[styles.loading, { color: theme.textTertiary }]}>Loading…</Text>
      ) : (
        <>
          <SummaryCards summary={summary} />
          <AllocationPie summary={summary} />
          <IncomeExpenseBar summary={summary} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  greeting: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 16 },
  loading: { textAlign: 'center', marginTop: 30, fontSize: 15 },
});
