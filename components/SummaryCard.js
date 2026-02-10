import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../utils/formatters';

export default function SummaryCard({ availableMonthly, incomeStatus, isDarkMode }) {
  return (
    <View style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}>
      <View>
        <Text style={[styles.summaryLabel, isDarkMode && styles.summaryLabelDark]}>Nivel de ingresos</Text>
        <Text style={[styles.summaryValue, isDarkMode && styles.summaryValueDark]}>{incomeStatus}</Text>
      </View>
      <View style={[styles.summaryDivider, isDarkMode && styles.summaryDividerDark]} />
      <View>
        <Text style={[styles.summaryLabel, isDarkMode && styles.summaryLabelDark]}>Disponible por mes</Text>
        <Text style={[styles.summaryValue, isDarkMode && styles.summaryValueDark]}>{formatCurrency(availableMonthly)}</Text>
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
  summaryCardDark: {
    backgroundColor: '#111827',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryLabelDark: {
    color: '#94A3B8',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  summaryValueDark: {
    color: '#F8FAFC',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  summaryDividerDark: {
    backgroundColor: '#374151',
  },
});
