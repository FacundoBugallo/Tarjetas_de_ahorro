import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../utils/formatters';

export default function SummaryCard({ availableMonthly }) {
  return (
    <View style={styles.summaryCard}>
      <View>
        <Text style={styles.summaryLabel}>Nivel de ingresos</Text>
        <Text style={styles.summaryValue}>Estable</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View>
        <Text style={styles.summaryLabel}>Disponible por mes</Text>
        <Text style={styles.summaryValue}>{formatCurrency(availableMonthly)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
});
