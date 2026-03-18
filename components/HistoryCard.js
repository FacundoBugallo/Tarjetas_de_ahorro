import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/formatters';
import Card from './ui/Card';
import EmptyState from './ui/EmptyState';
import StatBox from './ui/StatBox';
import spacing from '../theme/spacing.ts';
import typography from '../theme/typography.ts';
import colors from '../theme/colors.ts';

const formatHistoryDate = (value) => {
  if (!value) return 'Fecha no disponible';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function HistoryCard({ items = [], currencyCode }) {
  const [expandedItems, setExpandedItems] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc.completed += 1;
          acc.totalPoints += item.points || 0;
          acc.totalTarget += item.targetAmount || 0;
          return acc;
        },
        { completed: 0, totalPoints: 0, totalTarget: 0 },
      ),
    [items],
  );

  return (
    <Card style={styles.card}>
      <Pressable style={styles.headerRow} onPress={() => setIsCollapsed((prev) => !prev)}>
        <Text style={styles.title}>Historial detallado</Text>
        <Text style={styles.collapseText}>{isCollapsed ? 'Mostrar' : 'Minimizar'}</Text>
      </Pressable>

      {!isCollapsed && (
        <View style={styles.summaryRow}>
          <StatBox label="Metas" value={String(totals.completed)} />
          <StatBox label="Puntos" value={String(totals.totalPoints)} />
          <StatBox label="Movido" value={formatCurrency(totals.totalTarget, currencyCode)} />
        </View>
      )}

      {isCollapsed ? null : items.length === 0 ? (
        <EmptyState title="Sin historial aún" description="Completa tu primera meta para ver el detalle acá." icon="history" />
      ) : (
        items.map((item) => {
          const isExpanded = !!expandedItems[item.id];
          return (
            <Pressable
              key={item.id}
              style={styles.historyItem}
              onPress={() => setExpandedItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
            >
              <View style={styles.historyMainRow}>
                <View style={styles.historyTextWrap}>
                  <Text style={styles.historyLabel}>{item.name}</Text>
                  <Text style={styles.historyMeta}>
                    {item.savingType || 'General'} · {formatHistoryDate(item.completedAt)}
                  </Text>
                </View>
                <Text style={styles.historyValue}>+{item.points} pts</Text>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailChip}>
                  <MaterialCommunityIcons name="target" size={13} color="#86EFAC" />
                  <Text style={styles.detailText}>Meta: {formatCurrency(item.targetAmount, currencyCode)}</Text>
                </View>
                <View style={styles.detailChip}>
                  <MaterialCommunityIcons name="cash-fast" size={13} color="#93C5FD" />
                  <Text style={styles.detailText}>Aporte: {formatCurrency(item.lastContribution || 0, currencyCode)}</Text>
                </View>
              </View>

              {!!item.description && (
                <Text numberOfLines={isExpanded ? undefined : 1} style={styles.historyDescription}>
                  {item.description}
                </Text>
              )}
            </Pressable>
          );
        })
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.subtitle, color: colors.textPrimary },
  collapseText: { ...typography.caption, color: colors.secondary, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: spacing.xs },
  historyItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: spacing.xs,
  },
  historyMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.xs },
  historyTextWrap: { flex: 1 },
  historyLabel: { ...typography.body, color: colors.textPrimary, fontWeight: '700' },
  historyMeta: { ...typography.caption, color: colors.textSecondary },
  detailsGrid: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  detailText: { ...typography.caption, color: colors.textPrimary },
  historyDescription: { ...typography.body, color: colors.textSecondary },
  historyValue: { ...typography.body, color: colors.textPrimary, fontWeight: '700' },
});
