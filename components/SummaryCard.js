import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../utils/formatters';

export default function SummaryCard({ availableMonthly, incomeStatus, isDarkMode }) {
  return (
    <View style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}>
      <View>
        <Text style={[styles.summaryLabel, isDarkMode && styles.summaryLabelDark]}>📈 Nivel de ingresos</Text>
        <Text style={[styles.summaryValue, isDarkMode && styles.summaryValueDark]}>{incomeStatus}</Text>
      </View>
      <View style={[styles.summaryDivider, isDarkMode && styles.summaryDividerDark]} />
      <View>
        <Text style={[styles.summaryLabel, isDarkMode && styles.summaryLabelDark]}>🏦 Disponible por mes</Text>
        <Text style={[styles.summaryValue, isDarkMode && styles.summaryValueDark]}>{formatCurrency(availableMonthly)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#0B1120',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#22D3EE',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  summaryCardDark: {
    backgroundColor: '#020617',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#67E8F9',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryLabelDark: {
    color: '#A5F3FC',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 6,
  },
  summaryValueDark: {
    color: '#F8FAFC',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#22D3EE',
  },
  summaryDividerDark: {
    backgroundColor: '#374151',
  },
});
