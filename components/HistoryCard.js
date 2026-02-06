import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../utils/formatters';

export default function HistoryCard({ items = [] }) {
  return (
    <View style={styles.historyCard}>
      <Text style={styles.historyTitle}>Historial</Text>
      {items.length === 0 ? (
        <Text style={styles.historyEmpty}>
          Aún no hay tarjetas completadas.
        </Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <View>
              <Text style={styles.historyLabel}>{item.name}</Text>
              <Text style={styles.historyMeta}>
                Meta: {formatCurrency(item.targetAmount)}
              </Text>
            </View>
            <Text style={styles.historyValue}>+{item.points} pts</Text>
          </View>
        ))
      )}
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
  historyEmpty: {
    fontSize: 13,
    color: '#6B7280',
  },
  historyLabel: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  historyMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  historyValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
});
