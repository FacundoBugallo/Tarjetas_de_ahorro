import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { clampPercentage, formatCurrency } from '../utils/formatters';
import { formatContributionSchedule, getDaysUntilNextContribution } from '../utils/schedule';

export default function SavingsCard({
  card,
  onAddContribution,
  onRemoveContribution,
  onUpdateContribution,
  onDeleteCard,
  isDarkMode,
  currencyCode,
}) {
  const [isEditingContribution, setIsEditingContribution] = useState(false);
  const [draftContribution, setDraftContribution] = useState(String(card.nextContribution));
  const percentage = clampPercentage((card.savedAmount / card.targetAmount) * 100);
  const daysUntilNextContribution = getDaysUntilNextContribution(card);

  const handleSaveContribution = () => {
    const parsedContribution = Number(draftContribution);

    if (Number.isNaN(parsedContribution) || parsedContribution <= 0) {
      return;
    }

    onUpdateContribution(card.id, parsedContribution);
    setIsEditingContribution(false);
  };

  return (
    <View style={[styles.card, { backgroundColor: card.color }]}> 
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle}>{card.name}</Text>
          <Pressable onPress={() => onDeleteCard(card.id)} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </Pressable>
        </View>
        <Text style={styles.cardTarget}>Meta: {formatCurrency(card.targetAmount, currencyCode)}</Text>
        {!!card.description && <Text style={styles.cardDescription}>{card.description}</Text>}
      </View>

      <View style={styles.progressRow}>
        <View style={[styles.progressTrack, isDarkMode && styles.progressTrackDark]}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Text style={styles.cardLabel}>Ahorro acumulado</Text>
          <Text style={styles.cardValue}>{formatCurrency(card.savedAmount, currencyCode)}</Text>
          <Text style={styles.cardCadence}>{formatContributionSchedule(card)}</Text>
          {daysUntilNextContribution !== null && (
            <Text style={styles.nextContributionText}>
              Próximo aporte en {daysUntilNextContribution} día{daysUntilNextContribution === 1 ? '' : 's'}
            </Text>
          )}

          {isEditingContribution ? (
            <View style={styles.editRow}>
              <TextInput
                value={draftContribution}
                onChangeText={setDraftContribution}
                keyboardType="numeric"
                style={styles.editInput}
              />
              <Pressable onPress={handleSaveContribution} style={styles.inlineButton}>
                <Text style={styles.inlineButtonText}>Guardar</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setDraftContribution(String(card.nextContribution));
                setIsEditingContribution(true);
              }}
              style={styles.editTriggerButton}
            >
              <Text style={styles.editTriggerText}>Editar aporte</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.actionColumn}>
          <Pressable onPress={() => onAddContribution(card.id)} style={styles.addButton}>
            <Text style={styles.addButtonText}>+{formatCurrency(card.nextContribution, currencyCode)}</Text>
          </Pressable>
          <Pressable onPress={() => onRemoveContribution(card.id)} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>-{formatCurrency(card.nextContribution, currencyCode)}</Text>
          </Pressable>
        </View>
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
    shadowColor: '#020617',
    shadowOpacity: 0.42,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  cardHeader: { marginBottom: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#020617', flex: 1 },
  deleteButton: { backgroundColor: 'rgba(15,23,42,0.16)', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  deleteButtonText: { fontWeight: '700', fontSize: 12, color: '#1E3A8A' },
  cardTarget: { marginTop: 4, fontSize: 13, color: '#0F172A' },
  cardDescription: { marginTop: 8, fontSize: 12, color: '#172554' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressTrackDark: { backgroundColor: '#E2E8F0' },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 999 },
  progressText: { fontSize: 12, fontWeight: '700', color: '#020617' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 10,
  },
  footerLeft: { flex: 1 },
  cardLabel: { fontSize: 12, color: '#0F172A' },
  cardValue: { fontSize: 16, fontWeight: '700', color: '#020617', marginTop: 2 },
  cardCadence: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  nextContributionText: { marginTop: 6, fontSize: 12, fontWeight: '600', color: '#1E3A8A' },
  actionColumn: { gap: 8 },
  addButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  addButtonText: { color: '#F9FAFB', fontWeight: '700', fontSize: 13 },
  removeButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  removeButtonText: { color: '#DBEAFE', fontWeight: '700', fontSize: 13 },
  editTriggerButton: { marginTop: 8 },
  editTriggerText: { color: '#1E3A8A', fontWeight: '700', fontSize: 12 },
  editRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  inlineButton: { backgroundColor: '#1D4ED8', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  inlineButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
