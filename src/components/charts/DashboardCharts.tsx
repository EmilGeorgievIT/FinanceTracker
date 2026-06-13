import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-gifted-charts';
import { formatEur } from '../../utils/currency';
import { useTheme } from '../../stores/useUiStore';
import type { DashboardSummary } from '../../hooks/useDashboardData';

const screenW = Dimensions.get('window').width - 64;

interface Props {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: Props) {
  const theme = useTheme();
  const netSavings = summary.totalSavingsBalance;
  const netDebt = summary.totalDebtBalance;
  const monthlyNet = summary.totalMonthlyIncome - summary.totalMonthlyExpenses;
  const holdingsPnl = summary.holdingsValue - summary.holdingsCost;

  const cards: { label: string; value: string; color: string }[] = [
    { label: 'Savings', value: formatEur(netSavings), color: '#27ae60' },
    { label: 'Debt', value: formatEur(netDebt), color: '#e74c3c' },
    { label: 'Monthly Net', value: formatEur(monthlyNet), color: monthlyNet >= 0 ? '#2ecc71' : '#c0392b' },
    { label: 'Holdings P&L', value: formatEur(holdingsPnl), color: holdingsPnl >= 0 ? '#2ecc71' : '#c0392b' },
  ];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
      {cards.map((c) => (
        <View key={c.label} style={[css.card, { backgroundColor: theme.cardBg, borderColor: theme.border, borderLeftColor: c.color, borderLeftWidth: 3 }]}>
          <Text style={[css.cardLabel, { color: theme.textTertiary }]}>{c.label}</Text>
          <Text style={[css.cardValue, { color: c.color }]}>{c.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function AllocationPie({ summary }: Props) {
  const theme = useTheme();
  const data = [];
  if (summary.totalSavingsBalance > 0) {
    data.push({ value: summary.totalSavingsBalance, color: '#27ae60', text: 'Savings' });
  }
  if (summary.holdingsValue > 0) {
    data.push({ value: summary.holdingsValue, color: '#8e44ad', text: 'Holdings' });
  }
  if (summary.totalDebtBalance > 0) {
    data.push({ value: summary.totalDebtBalance, color: '#e74c3c', text: 'Debt' });
  }
  data.push({ value: summary.totalMonthlyIncome, color: '#2ecc71', text: 'Income' });
  data.push({ value: summary.totalMonthlyExpenses, color: '#c0392b', text: 'Expenses' });

  if (data.length === 0) return null;

  return (
    <View style={[css.chartBox, { backgroundColor: theme.chartBg }]}>
      <Text style={[css.chartTitle, { color: theme.text }]}>Monthly Overview</Text>
      <PieChart
        data={data}
        donut
        radius={100}
        innerRadius={60}
        isAnimated={false}
        centerLabelComponent={() => (
          <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 14, color: theme.text }}>
            {formatEur(summary.totalMonthlyIncome - summary.totalMonthlyExpenses)}
          </Text>
        )}
      />
    </View>
  );
}

export function IncomeExpenseBar({ summary }: Props) {
  const theme = useTheme();
  const data = [
    { value: summary.totalMonthlyIncome, label: 'Income', frontColor: '#2ecc71' },
    { value: summary.totalMonthlyExpenses, label: 'Expenses', frontColor: '#c0392b' },
  ];

  return (
    <View style={[css.chartBox, { backgroundColor: theme.chartBg }]}>
      <Text style={[css.chartTitle, { color: theme.text }]}>Income vs Expenses</Text>
      <BarChart
        data={data}
        width={screenW}
        height={180}
        barWidth={60}
        spacing={40}
        noOfSections={4}
        yAxisTextStyle={{ color: theme.textTertiary }}
        renderTooltip={(item: any) => (
          <View style={{ padding: 4, backgroundColor: theme.text, borderRadius: 4 }}>
            <Text style={{ color: theme.background, fontSize: 12 }}>{formatEur(item.value)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const css = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
  },
  cardLabel: { fontSize: 11, textTransform: 'uppercase', marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: '700' },
  chartBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  chartTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, alignSelf: 'flex-start' },
});
