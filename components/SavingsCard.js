import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { clampPercentage, formatCurrency } from '../utils/formatters';
import { formatContributionSchedule, getDaysUntilNextContribution } from '../utils/schedule';

export default function SavingsCard({ card, onAddContribution, isDarkMode }) {
  const percentage = clampPercentage(
    (card.savedAmount / card.targetAmount) * 100,
  );
  const daysUntilNextContribution = getDaysUntilNextContribution(card);

  return (
    <View style={[styles.card, { backgroundColor: card.color }]}> 
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{card.name}</Text>
        <Text style={styles.cardTarget}>
          Meta: {formatCurrency(card.targetAmount)}
        </Text>
        {!!card.description && (
          <Text style={styles.cardDescription}>{card.description}</Text>
        )}
      </View>

      <View style={styles.progressRow}>
        <View style={[styles.progressTrack, isDarkMode && styles.progressTrackDark]}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.cardLabel}>💰 Ahorro acumulado</Text>
          <Text style={styles.cardValue}>{formatCurrency(card.savedAmount)}</Text>
          <Text style={styles.cardCadence}>{formatContributionSchedule(card)}</Text>
          {daysUntilNextContribution !== null && (
            <Text style={styles.nextContributionText}>
              Próximo aporte en {daysUntilNextContribution} día{daysUntilNextContribution === 1 ? '' : 's'}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => onAddContribution(card.id)}
          style={styles.addButton}
        >
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
    borderWidth: 1,
    borderColor: '#0F172A',
    shadowColor: '#0F172A',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#020617',
  },
  cardTarget: {
    marginTop: 4,
    fontSize: 13,
    color: '#0F172A',
  },
  cardDescription: {
    marginTop: 8,
    fontSize: 12,
    color: '#172554',
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
  progressTrackDark: {
    backgroundColor: '#E2E8F0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 999,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#020617',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#0F172A',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#020617',
    marginTop: 2,
  },
  cardCadence: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  nextContributionText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#312E81',
  },
  addButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: '#A21CAF',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  addButtonText: {
    color: '#F9FAFB',
    fontWeight: '600',
    fontSize: 13,
  },
});
