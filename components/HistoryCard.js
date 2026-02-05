import { StyleSheet, Text, View } from 'react-native';

export default function HistoryCard() {
  return (
    <View style={styles.historyCard}>
      <Text style={styles.historyTitle}>Historial de la semana</Text>
      <View style={styles.historyItem}>
        <Text style={styles.historyLabel}>Lunes</Text>
        <Text style={styles.historyValue}>2/3 tarjetas aportaron</Text>
      </View>
      <View style={styles.historyItem}>
        <Text style={styles.historyLabel}>Martes</Text>
        <Text style={styles.historyValue}>Alerta: faltó 1 aporte</Text>
      </View>
      <View style={styles.historyItem}>
        <Text style={styles.historyLabel}>Miércoles</Text>
        <Text style={styles.historyValue}>+25 pts por ahorro anticipado</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  historyValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
});
