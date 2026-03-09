import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/formatters';

const formatHistoryDate = (value) => {
  if (!value) {
    return 'Fecha no disponible';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function HistoryCard({ items = [], currencyCode }) {
  const [expandedItems, setExpandedItems] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.completed += 1;
        acc.totalPoints += item.points || 0;
        acc.totalTarget += item.targetAmount || 0;
        return acc;
      },
      { completed: 0, totalPoints: 0, totalTarget: 0 },
    );
  }, [items]);

  const toggleItem = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={[styles.historyCard, styles.historyCardDark]}>
      <Pressable style={styles.headerRow} onPress={() => setIsCollapsed((prev) => !prev)}>
        <Text style={[styles.historyTitle, styles.historyTitleDark]}>Historial detallado</Text>
        <Text style={[styles.collapseText, styles.collapseTextDark]}>{isCollapsed ? 'Mostrar' : 'Minimizar'}</Text>
      </Pressable>

      {!isCollapsed && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryValue}>{totals.completed}</Text>
            <Text style={styles.summaryLabel}>metas</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryValue}>{totals.totalPoints}</Text>
            <Text style={styles.summaryLabel}>puntos</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryValue}>{formatCurrency(totals.totalTarget, currencyCode)}</Text>
            <Text style={styles.summaryLabel}>movido</Text>
          </View>
        </View>
      )}

      {isCollapsed ? null : items.length === 0 ? (
        <Text style={[styles.historyEmpty, styles.historyEmptyDark]}>
          Aún no hay metas completadas.
        </Text>
      ) : (
        items.map((item) => {
          const isExpanded = !!expandedItems[item.id];
          return (
            <Pressable
              key={item.id}
              style={[styles.historyItem, styles.historyItemDark]}
              onPress={() => toggleItem(item.id)}
            >
              <View style={styles.historyMainRow}>
                <View style={styles.historyTextWrap}>
                  <Text style={[styles.historyLabel, styles.historyLabelDark]}>{item.name}</Text>
                  <Text style={styles.historyMeta}>{item.savingType || 'General'} · {formatHistoryDate(item.completedAt)}</Text>
                </View>
                <Text style={[styles.historyValue, styles.historyValueDark]}>+{item.points} pts</Text>
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
                <Text
                  numberOfLines={isExpanded ? undefined : 1}
                  style={[styles.historyDescription, styles.historyDescriptionDark]}
                >
                  {item.description}
                </Text>
              )}

              <Text style={[styles.expandText, styles.expandTextDark]}>{isExpanded ? 'Ver menos' : 'Ver más'}</Text>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  historyCardDark: {
    backgroundColor: 'rgba(20,20,26,0.72)',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: { fontSize: 16, fontWeight: '800' },
  historyTitleDark: { color: '#F8F6F0' },
  collapseText: { fontWeight: '700', fontSize: 12 },
  collapseTextDark: { color: '#FFFFFF' },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  summaryPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  summaryValue: { color: '#F8FAFC', fontWeight: '800', fontSize: 12 },
  summaryLabel: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 6,
  },
  historyItemDark: { borderBottomColor: '#1E293B' },
  historyMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  historyTextWrap: { flex: 1 },
  historyEmpty: { fontSize: 13, color: '#737373' },
  historyEmptyDark: { color: '#737373' },
  historyLabel: { fontSize: 13, fontWeight: '600' },
  historyLabelDark: { color: '#F8F6F0' },
  historyMeta: { marginTop: 4, fontSize: 11, color: '#94A3B8' },
  detailsGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailText: { color: '#E2E8F0', fontSize: 11 },
  historyDescription: { fontSize: 12, lineHeight: 18 },
  historyDescriptionDark: { color: '#D4D4D4' },
  historyValue: { fontSize: 13, fontWeight: '700' },
  historyValueDark: { color: '#FFFFFF' },
  expandText: { fontSize: 12, fontWeight: '600' },
  expandTextDark: { color: '#FFFFFF' },
});
