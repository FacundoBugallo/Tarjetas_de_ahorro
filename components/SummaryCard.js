import { StyleSheet, Text, View } from 'react-native';
import palette from '../theme/colors';
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
    shadowColor: palette.black,
    shadowOpacity: 0.5,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  summaryCardDark: {
    backgroundColor: 'rgba(20,20,26,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  summaryCardLight: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  summaryLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryLabelDark: { color: palette.silverMist },
  summaryLabelLight: { color: palette.midnightSlate },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  summaryValueDark: { color: palette.white },
  summaryValueLight: { color: palette.black },
  summaryDivider: {
    width: 1,
    height: 46,
  },
  summaryDividerDark: { backgroundColor: palette.silverMist },
  summaryDividerLight: { backgroundColor: palette.midnightSlate },
  remainingText: {
    marginTop: 4,
    fontSize: 12,
    color: palette.white,
    fontWeight: '700',
  },
});
