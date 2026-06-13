import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDashboardData } from '../../src/hooks/useDashboardData';
import { usePriceRefresh } from '../../src/hooks/usePriceRefresh';
import { SummaryCards, IncomeExpenseBar } from '../../src/components/charts/DashboardCharts';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useTheme, useT } from '../../src/stores/useUiStore';
import { formatEur } from '../../src/utils/currency';

type FilterKey = 'overview' | 'assets' | 'debts' | 'income' | 'expenses';

const FILTERS: { key: FilterKey; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'overview', labelKey: 'overview', icon: 'apps-outline' },
  { key: 'assets', labelKey: 'assets', icon: 'trending-up-outline' },
  { key: 'debts', labelKey: 'debts', icon: 'trending-down-outline' },
  { key: 'income', labelKey: 'income', icon: 'cash-outline' },
  { key: 'expenses', labelKey: 'expenses', icon: 'card-outline' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const t = useT();
  const { summary, loading, refresh } = useDashboardData();
  const { refreshing: priceRefreshing, refreshAll } = usePriceRefresh();
  const [filter, setFilter] = useState<FilterKey>('overview');

  const handleRefreshPrices = async () => {
    await refreshAll();
    refresh();
  };

  const monthlyNet = summary.totalMonthlyIncome - summary.totalMonthlyExpenses;
  const holdingsPnl = summary.holdingsValue - summary.holdingsCost;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>

      {/* Refresh button */}
      <View style={styles.row}>
        <Button
          title={priceRefreshing ? `${t('refreshing')}` : t('refreshPrices')}
          variant="secondary"
          onPress={handleRefreshPrices}
          style={{ flex: 1, paddingVertical: 10 }}
        />
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.chip,
              {
                backgroundColor: filter === f.key ? theme.primary : theme.surface,
                borderColor: filter === f.key ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Ionicons name={f.icon} size={16} color={filter === f.key ? '#fff' : theme.textSecondary} />
            <Text style={[styles.chipText, { color: filter === f.key ? '#fff' : theme.textSecondary }]}>{t(f.labelKey as any)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <Text style={[styles.loading, { color: theme.textTertiary }]}>{t('loading')}</Text>
      ) : (
        <>
          {/* Monthly Summary Card */}
          <Card style={styles.summaryCard}>
            <Text style={[styles.monthLabel, { color: theme.textSecondary }]}>{t('monthlyNet')}</Text>
            <Text style={[styles.netValue, { color: monthlyNet >= 0 ? theme.success : theme.danger }]}>
              {monthlyNet >= 0 ? '+' : ''}{formatEur(monthlyNet)}
            </Text>
            <Text style={[styles.netSubtitle, { color: theme.textTertiary }]}>{t('incomeMinusExpenses')}</Text>
          </Card>

          {/* Bar chart */}
          {(filter === 'overview' || filter === 'income' || filter === 'expenses') && (
            <IncomeExpenseBar summary={summary} />
          )}

          {/* Summary cards */}
          {(filter === 'overview' || filter === 'assets') && (
            <View style={styles.quickSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('assets')}</Text>
              <Card style={styles.statsCard}>
                <View style={styles.statRow}>
                  <View>
                    <Text style={[styles.statValue, { color: theme.success }]}>{formatEur(summary.totalSavingsBalance + summary.holdingsValue)}</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('trackersCount', { count: summary.assetTrackerCount })}</Text>
                  </View>
                  <Ionicons name="trending-up-outline" size={28} color={theme.success} />
                </View>
              </Card>
            </View>
          )}

          {(filter === 'overview' || filter === 'debts') && (
            <View style={styles.quickSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('debts')}</Text>
              <Card style={styles.statsCard}>
                <View style={styles.statRow}>
                  <View>
                    <Text style={[styles.statValue, { color: theme.danger }]}>{formatEur(summary.totalDebtBalance)}</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('trackersCount', { count: summary.debtTrackerCount })}</Text>
                  </View>
                  <Ionicons name="trending-down-outline" size={28} color={theme.danger} />
                </View>
              </Card>
            </View>
          )}

          {(filter === 'overview' || filter === 'income') && (
            <View style={styles.quickSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('incomeMonthly')}</Text>
              <Card style={styles.statsCard}>
                <View style={styles.statRow}>
                  <View>
                    <Text style={[styles.statValue, { color: theme.success }]}>{formatEur(summary.totalMonthlyIncome)}</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('trackersCount', { count: summary.incomeTrackerCount })}</Text>
                  </View>
                  <Ionicons name="cash-outline" size={28} color={theme.success} />
                </View>
              </Card>
            </View>
          )}

          {(filter === 'overview' || filter === 'expenses') && (
            <View style={styles.quickSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('expensesMonthly')}</Text>
              <Card style={styles.statsCard}>
                <View style={styles.statRow}>
                  <View>
                    <Text style={[styles.statValue, { color: theme.danger }]}>{formatEur(summary.totalMonthlyExpenses)}</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('trackersCount', { count: summary.expenseTrackerCount })}</Text>
                  </View>
                  <Ionicons name="card-outline" size={28} color={theme.danger} />
                </View>
              </Card>
            </View>
          )}

          {/* Holdings P&L */}
          {(filter === 'overview' || filter === 'assets') && summary.holdingsValue > 0 && (
            <View style={styles.quickSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('holdingsPL')}</Text>
              <Card style={styles.statsCard}>
                <View style={styles.statRow}>
                  <View>
                    <Text style={[styles.statValue, { color: holdingsPnl >= 0 ? theme.success : theme.danger }]}>
                      {holdingsPnl >= 0 ? '+' : ''}{formatEur(holdingsPnl)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('value')}: {formatEur(summary.holdingsValue)}</Text>
                  </View>
                  <Ionicons name="bar-chart-outline" size={28} color={holdingsPnl >= 0 ? theme.success : theme.danger} />
                </View>
              </Card>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterScroll: { marginBottom: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  loading: { textAlign: 'center', marginTop: 30, fontSize: 15 },
  summaryCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  monthLabel: { fontSize: 14, marginBottom: 4 },
  netValue: { fontSize: 36, fontWeight: '800' },
  netSubtitle: { fontSize: 12, marginTop: 4 },
  quickSection: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  statsCard: { paddingVertical: 14, paddingHorizontal: 16 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 2 },
});
