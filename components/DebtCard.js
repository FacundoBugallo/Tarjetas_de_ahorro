import { StyleSheet, Text, View } from 'react-native';
import DarkButton from './DarkButton';
import { formatCurrency } from '../utils/formatters';

export default function DebtCard({ debt, onAddPayment, onRemovePayment, isDarkMode, currencyCode }) {
  const remaining = Math.max(debt.totalToPay - debt.paidAmount, 0);

  return (
    <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, isDarkMode ? styles.titleDark : styles.titleLight]}>{debt.name}</Text>
        <Text style={[styles.tag, isDarkMode ? styles.tagDark : styles.tagLight]}>{debt.cadence}</Text>
      </View>

      <Text style={[styles.summary, isDarkMode ? styles.textDark : styles.textLight]}>
        A pagar para cancelar: {formatCurrency(debt.totalToPay, currencyCode)}
      </Text>
      <Text style={[styles.summary, isDarkMode ? styles.textDark : styles.textLight]}>
        Cuota por periodo: {formatCurrency(debt.paymentAmount, currencyCode)}
      </Text>
      <Text style={[styles.summary, isDarkMode ? styles.textDark : styles.textLight]}>
        Pagado: {formatCurrency(debt.paidAmount, currencyCode)} • Resta: {formatCurrency(remaining, currencyCode)}
      </Text>

      <View style={styles.actionsRow}>
        <DarkButton
          onPress={() => onRemovePayment(debt.id)}
          label="Alejar monto"
          style={styles.actionButton}
          gradientStyle={styles.actionGradient}
          textStyle={styles.actionText}
        />
        <DarkButton
          onPress={() => onAddPayment(debt.id)}
          label="Pagar periodo"
          style={styles.actionButton}
          gradientStyle={styles.actionGradient}
          textStyle={styles.actionText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
  cardDark: { backgroundColor: 'rgba(20,20,26,0.72)', borderColor: 'rgba(255,255,255,0.15)' },
  cardLight: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '800' },
  titleDark: { color: '#FFFFFF' },
  titleLight: { color: '#111111' },
  tag: { fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  tagDark: { color: '#111111', backgroundColor: '#FFFFFF' },
  tagLight: { color: '#FFFFFF', backgroundColor: '#111111' },
  summary: { fontSize: 13, fontWeight: '600' },
  textDark: { color: '#E5E7EB' },
  textLight: { color: '#111111' },
  actionsRow: { marginTop: 10, flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1 },
  actionGradient: { width: '100%', height: 44, borderRadius: 10 },
  actionText: { fontWeight: '700', fontSize: 12 },
});
