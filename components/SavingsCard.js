import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DarkButton from './DarkButton';
import { clampPercentage, formatCurrency } from '../utils/formatters';
import { formatContributionSchedule, getDaysUntilNextContribution } from '../utils/schedule';

const getContrastTextColor = (hexColor = '#FFFFFF') => {
  const sanitized = hexColor.replace('#', '');
  const normalized = sanitized.length === 3
    ? sanitized.split('').map((char) => char + char).join('')
    : sanitized;

  if (normalized.length !== 6) {
    return '#111111';
  }

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const brightness = ((red * 299) + (green * 587) + (blue * 114)) / 1000;

  return brightness > 150 ? '#111111' : '#F9FAFB';
};

const withOpacity = (hexColor, alpha) => {
  const sanitized = hexColor.replace('#', '');
  const normalized = sanitized.length === 3
    ? sanitized.split('').map((char) => char + char).join('')
    : sanitized;

  if (normalized.length !== 6) {
    return `rgba(17,17,17,${alpha})`;
  }

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

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
  const contentColor = getContrastTextColor(card.color);
  const subtleContentColor = withOpacity(contentColor, 0.82);
  const buttonSurfaceColor = withOpacity(contentColor, 0.16);

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
          <Text style={[styles.cardTitle, { color: contentColor }]}>{card.name}</Text>
          <DarkButton
            onPress={() => onDeleteCard(card.id)}
            label="Eliminar"
            style={styles.deleteButtonWrapper}
            gradientStyle={[styles.deleteButton, { borderColor: buttonSurfaceColor }]}
            textStyle={[styles.deleteButtonText, { color: contentColor }]}
          />
        </View>
        <Text style={[styles.cardTarget, { color: subtleContentColor }]}>Meta: {formatCurrency(card.targetAmount, currencyCode)}</Text>
        {!!card.description && <Text style={[styles.cardDescription, { color: subtleContentColor }]}>{card.description}</Text>}
      </View>

      <View style={styles.progressRow}>
        <View style={[styles.progressTrack, isDarkMode && styles.progressTrackDark]}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={[styles.progressText, { color: contentColor }]}>{percentage.toFixed(0)}%</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Text style={[styles.cardLabel, { color: subtleContentColor }]}>Ahorro acumulado</Text>
          <Text style={[styles.cardValue, { color: contentColor }]}>{formatCurrency(card.savedAmount, currencyCode)}</Text>
          <Text style={[styles.cardCadence, { color: subtleContentColor }]}>{formatContributionSchedule(card)}</Text>
          {daysUntilNextContribution !== null && (
            <Text style={[styles.nextContributionText, { color: subtleContentColor }]}>
              Próximo aporte en {daysUntilNextContribution} día{daysUntilNextContribution === 1 ? '' : 's'}
            </Text>
          )}

          {isEditingContribution ? (
            <View style={styles.editRow}>
              <TextInput
                value={draftContribution}
                onChangeText={setDraftContribution}
                keyboardType="numeric"
                style={[styles.editInput, { color: contentColor, borderColor: withOpacity(contentColor, 0.5), backgroundColor: withOpacity(contentColor, 0.12) }]}
              />
              <DarkButton
                onPress={handleSaveContribution}
                label="Guardar"
                style={styles.inlineButtonWrapper}
                gradientStyle={styles.inlineButton}
                textStyle={styles.inlineButtonText}
              />
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setDraftContribution(String(card.nextContribution));
                setIsEditingContribution(true);
              }}
              style={styles.editTriggerButton}
            >
              <Text style={[styles.editTriggerText, { color: contentColor }]}>Editar aporte</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.actionColumn}>
          <DarkButton
            onPress={() => onAddContribution(card.id)}
            label={`+${formatCurrency(card.nextContribution, currencyCode)}`}
            gradientStyle={styles.addButton}
            textStyle={styles.addButtonText}
          />
          <DarkButton
            onPress={() => onRemoveContribution(card.id)}
            label={`-${formatCurrency(card.nextContribution, currencyCode)}`}
            gradientStyle={styles.removeButton}
            textStyle={styles.removeButtonText}
          />
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
    borderColor: '#111111',
    shadowColor: '#000000',
    shadowOpacity: 0.42,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  cardHeader: { marginBottom: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#000000', flex: 1 },
  deleteButtonWrapper: { minWidth: 88 },
  deleteButton: { width: '100%', height: 34, borderRadius: 999 },
  deleteButtonText: { fontWeight: '700', fontSize: 12, color: '#000000' },
  cardTarget: { marginTop: 4, fontSize: 13, color: '#111111' },
  cardDescription: { marginTop: 8, fontSize: 12, color: '#262626' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressTrackDark: { backgroundColor: '#E5E7EB' },
  progressFill: { height: '100%', backgroundColor: '#000000', borderRadius: 999 },
  progressText: { fontSize: 12, fontWeight: '700', color: '#000000' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 10,
  },
  footerLeft: { flex: 1 },
  cardLabel: { fontSize: 12, color: '#111111' },
  cardValue: { fontSize: 16, fontWeight: '700', color: '#000000', marginTop: 2 },
  cardCadence: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#000000' },
  nextContributionText: { marginTop: 6, fontSize: 12, fontWeight: '600', color: '#000000' },
  actionColumn: { gap: 8 },
  addButton: {
    width: 158,
    height: 42,
    borderRadius: 14,
  },
  addButtonText: { fontWeight: '700', fontSize: 13 },
  removeButton: {
    width: 158,
    height: 42,
    borderRadius: 14,
  },
  removeButtonText: { fontWeight: '700', fontSize: 13 },
  editTriggerButton: { marginTop: 8 },
  editTriggerText: { color: '#000000', fontWeight: '700', fontSize: 12 },
  editRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  inlineButtonWrapper: { minWidth: 110 },
  inlineButton: { width: '100%', height: 38, borderRadius: 10 },
  inlineButtonText: { fontWeight: '700', fontSize: 12 },
});
