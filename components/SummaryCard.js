import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../utils/formatters';

export default function SummaryCard({ plannedInvestment, actualInvestment, isDarkMode }) {
  const remaining = Math.max(plannedInvestment - actualInvestment, 0);

  return (
    <View style={[styles.summaryCard, isDarkMode ? styles.summaryCardDark : styles.summaryCardLight]}>
      <View>
        <Text style={[styles.summaryLabel, isDarkMode ? styles.summaryLabelDark : styles.summaryLabelLight]}>
          Destinado a invertir
        </Text>
        <Text style={[styles.summaryValue, isDarkMode ? styles.summaryValueDark : styles.summaryValueLight]}>
          {formatCurrency(plannedInvestment)}
        </Text>
      </View>
      <View style={[styles.summaryDivider, isDarkMode ? styles.summaryDividerDark : styles.summaryDividerLight]} />
      <View>
        <Text style={[styles.summaryLabel, isDarkMode ? styles.summaryLabelDark : styles.summaryLabelLight]}>
          Invertido real
        </Text>
        <Text style={[styles.summaryValue, isDarkMode ? styles.summaryValueDark : styles.summaryValueLight]}>
          {formatCurrency(actualInvestment)}
        </Text>
        <Text style={styles.remainingText}>Restante: {formatCurrency(remaining)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#020617',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  summaryCardDark: {
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  summaryCardLight: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  summaryLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryLabelDark: { color: '#93C5FD' },
  summaryLabelLight: { color: '#1D4ED8' },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  summaryValueDark: { color: '#F8FAFC' },
  summaryValueLight: { color: '#0F172A' },
  summaryDivider: {
    width: 1,
    height: 46,
  },
  summaryDividerDark: { backgroundColor: '#1E3A8A' },
  summaryDividerLight: { backgroundColor: '#93C5FD' },
  remainingText: {
    marginTop: 4,
    fontSize: 12,
    color: '#60A5FA',
    fontWeight: '600',
  },
});
