import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { clampPercentage, formatCurrency } from '../utils/formatters';

export default function SavingsCard({ card }) {
  const percentage = clampPercentage(
    (card.savedAmount / card.targetAmount) * 100,
  );

  return (
    <View style={[styles.card, { backgroundColor: card.color }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{card.name}</Text>
        <Text style={styles.cardTarget}>
          Meta: {formatCurrency(card.targetAmount)}
        </Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.cardLabel}>Ahorro acumulado</Text>
          <Text style={styles.cardValue}>{formatCurrency(card.savedAmount)}</Text>
          <Text style={styles.cardCadence}>{card.cadence}</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>
            +{formatCurrency(card.nextContribution)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  cardTarget: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#111827',
    borderRadius: 999,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  cardCadence: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  addButton: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  addButtonText: {
    color: '#F9FAFB',
    fontWeight: '600',
    fontSize: 13,
  },
});
