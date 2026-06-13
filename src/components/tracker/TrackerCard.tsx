import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import type { TrackerRow } from '../../repositories/trackerRepository';
import { Card } from '../ui/Card';
import { formatEur } from '../../utils/currency';

interface Props {
  tracker: TrackerRow;
  subtitle?: string;
  onPress: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  savings_goal: 'Savings Goal',
  variable_holding: 'Variable Holding',
  mortgage: 'Mortgage',
  loan: 'Loan',
  income: 'Income',
  expense: 'Expense',
};

const TYPE_COLORS: Record<string, string> = {
  savings_goal: '#27ae60',
  variable_holding: '#8e44ad',
  mortgage: '#e74c3c',
  loan: '#e67e22',
  income: '#2ecc71',
  expense: '#c0392b',
};

export function TrackerCard({ tracker, subtitle, onPress }: Props) {
  const color = TYPE_COLORS[tracker.type] ?? '#999';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.left}>
          <Text style={styles.name}>{tracker.name}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.right}>
          <View style={[styles.badge, { backgroundColor: color + '18' }]}>
            <Text style={[styles.badgeText, { color }]}>
              {TYPE_LABELS[tracker.type] ?? tracker.type}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  left: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#222' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  right: {},
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
