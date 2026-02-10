import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../utils/formatters';

export default function SummaryCard({ plannedInvestment, actualInvestment, isDarkMode, currencyCode }) {
  const remaining = Math.max(plannedInvestment - actualInvestment, 0);

  return (
    <View style={[styles.summaryCard, isDarkMode ? styles.summaryCardDark : styles.summaryCardLight]}>
      <View>
        <Text style={[styles.summaryLabel, isDarkMode ? styles.summaryLabelDark : styles.summaryLabelLight]}>
          Destinado a ahorrar 🎯
        </Text>
        <Text style={[styles.summaryValue, isDarkMode ? styles.summaryValueDark : styles.summaryValueLight]}>
          {formatCurrency(plannedInvestment, currencyCode)}
        </Text>
      </View>
      <View style={[styles.summaryDivider, isDarkMode ? styles.summaryDividerDark : styles.summaryDividerLight]} />
      <View>
        <Text style={[styles.summaryLabel, isDarkMode ? styles.summaryLabelDark : styles.summaryLabelLight]}>
          Ahorrado real 💰
        </Text>
        <Text style={[styles.summaryValue, isDarkMode ? styles.summaryValueDark : styles.summaryValueLight]}>
          {formatCurrency(actualInvestment, currencyCode)}
        </Text>
        <Text style={styles.remainingText}>Restante: {formatCurrency(remaining, currencyCode)}</Text>
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
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  summaryCardDark: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  summaryCardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
  },
  summaryLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryLabelDark: { color: '#FCA5A5' },
  summaryLabelLight: { color: '#000000' },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  summaryValueDark: { color: '#F8F6F0' },
  summaryValueLight: { color: '#111111' },
  summaryDivider: {
    width: 1,
    height: 46,
  },
  summaryDividerDark: { backgroundColor: '#B91C1C' },
  summaryDividerLight: { backgroundColor: '#000000' },
  remainingText: {
    marginTop: 4,
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
});
