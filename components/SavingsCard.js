import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Card from './ui/Card';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';
import Badge from './ui/Badge';
import { clampPercentage, formatCurrency } from '../utils/formatters';
import { formatContributionSchedule, getDaysUntilNextContribution } from '../utils/schedule';
import colors from '../theme/colors.ts';
import spacing from '../theme/spacing.ts';
import typography from '../theme/typography.ts';

export default function SavingsCard({
  card,
  onAddContribution,
  onRemoveContribution,
  onUpdateContribution,
  onDeleteCard,
  currencyCode,
}) {
  const [isEditingContribution, setIsEditingContribution] = useState(false);
  const [draftContribution, setDraftContribution] = useState(String(card.nextContribution));
  const percentage = clampPercentage((card.savedAmount / card.targetAmount) * 100);
  const daysUntilNextContribution = getDaysUntilNextContribution(card);

  const handleSaveContribution = () => {
    const parsedContribution = Number(draftContribution);
    if (Number.isNaN(parsedContribution) || parsedContribution <= 0) return;
    onUpdateContribution(card.id, parsedContribution);
    setIsEditingContribution(false);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{card.name}</Text>
          <Text style={styles.meta}>Meta: {formatCurrency(card.targetAmount, currencyCode)}</Text>
          {!!card.savingType && <Badge label={card.savingType} color={card.color || colors.success} />}
        </View>
        <Button
          label="Eliminar"
          onPress={() => onDeleteCard(card.id)}
          variant="ghost"
          style={styles.deleteButton}
          accessibilityLabel={`Eliminar tarjeta ${card.name}`}
        />
      </View>

      {!!card.description && <Text style={styles.description}>{card.description}</Text>}

      <ProgressBar progress={percentage} color={card.color || colors.success} />

      <View style={styles.valueBlock}>
        <Text style={styles.label}>Ahorro acumulado</Text>
        <Text style={styles.value}>{formatCurrency(card.savedAmount, currencyCode)}</Text>
        <Text style={styles.meta}>{formatContributionSchedule(card)}</Text>
        {daysUntilNextContribution !== null && (
          <Text style={styles.meta}>
            Próximo aporte en {daysUntilNextContribution} día{daysUntilNextContribution === 1 ? '' : 's'}
          </Text>
        )}
      </View>

      {isEditingContribution ? (
        <View style={styles.editRow}>
          <TextInput
            value={draftContribution}
            onChangeText={setDraftContribution}
            keyboardType="numeric"
            style={styles.input}
            placeholder="Nuevo aporte"
            placeholderTextColor={colors.textSecondary}
          />
          <Button label="Guardar" onPress={handleSaveContribution} style={styles.editButton} />
        </View>
      ) : (
        <Pressable onPress={() => setIsEditingContribution(true)}>
          <Text style={styles.editText}>Editar aporte recurrente</Text>
        </Pressable>
      )}

      <View style={styles.actions}>
        <Button
          label={`+ ${formatCurrency(card.nextContribution, currencyCode)}`}
          onPress={() => onAddContribution(card.id)}
          style={styles.actionButton}
          accessibilityLabel={`Aportar a ${card.name}`}
        />
        <Button
          label={`- ${formatCurrency(card.nextContribution, currencyCode)}`}
          onPress={() => onRemoveContribution(card.id)}
          variant="secondary"
          style={styles.actionButton}
          accessibilityLabel={`Quitar aporte de ${card.name}`}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  headerLeft: { flex: 1, gap: spacing.xs },
  title: { ...typography.subtitle, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textSecondary },
  description: { ...typography.body, color: colors.textSecondary },
  deleteButton: { minWidth: 88, alignSelf: 'flex-start' },
  valueBlock: { gap: spacing.xxs },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: { ...typography.subtitle, color: colors.textPrimary },
  actions: { flexDirection: 'row', gap: spacing.xs },
  actionButton: { flex: 1 },
  editRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    color: colors.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  editButton: { minWidth: 120 },
  editText: { ...typography.caption, color: colors.secondary, fontWeight: '700' },
});
