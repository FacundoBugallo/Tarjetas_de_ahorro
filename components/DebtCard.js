import { Pressable, StyleSheet, Text, View } from 'react-native';
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
        <Pressable onPress={() => onRemovePayment(debt.id)} style={[styles.actionButton, styles.removeButton]}>
          <Text style={styles.actionText}>Alejar monto</Text>
        </Pressable>
        <Pressable onPress={() => onAddPayment(debt.id)} style={[styles.actionButton, styles.addButton]}>
          <Text style={styles.actionText}>Pagar periodo</Text>
        </Pressable>
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
  },
  cardDark: { backgroundColor: '#000000', borderColor: '#303030' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#111111' },
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
  actionButton: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  addButton: { backgroundColor: '#111111' },
  removeButton: { backgroundColor: '#4B5563' },
  actionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
