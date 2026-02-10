import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../utils/formatters';

export default function HistoryCard({ items = [], isDarkMode }) {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={[styles.historyCard, isDarkMode && styles.historyCardDark]}>
      <Text style={[styles.historyTitle, isDarkMode && styles.historyTitleDark]}>Historial</Text>
      {items.length === 0 ? (
        <Text style={[styles.historyEmpty, isDarkMode && styles.historyEmptyDark]}>
          Aún no hay tarjetas completadas.
        </Text>
      ) : (
        items.map((item) => {
          const isExpanded = !!expandedItems[item.id];
          return (
            <Pressable
              key={item.id}
              style={[styles.historyItem, isDarkMode && styles.historyItemDark]}
              onPress={() => toggleItem(item.id)}
            >
              <View style={styles.historyMainRow}>
                <View style={styles.historyTextWrap}>
                  <Text style={[styles.historyLabel, isDarkMode && styles.historyLabelDark]}>{item.name}</Text>
                  <Text style={styles.historyMeta}>
                    Meta: {formatCurrency(item.targetAmount)}
                  </Text>
                </View>
                <Text style={[styles.historyValue, isDarkMode && styles.historyValueDark]}>+{item.points} pts</Text>
              </View>

              {!!item.description && (
                <Text
                  numberOfLines={isExpanded ? undefined : 1}
                  style={[styles.historyDescription, isDarkMode && styles.historyDescriptionDark]}
                >
                  {item.description}
                </Text>
              )}

              {!!item.description && (
                <Text style={styles.expandText}>{isExpanded ? 'Ver menos' : 'Ver más'}</Text>
              )}
            </Pressable>
          );
        })
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
  historyCardDark: {
    backgroundColor: '#111827',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  historyTitleDark: { color: '#F8FAFC' },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 4,
  },
  historyItemDark: {
    borderBottomColor: '#1F2937',
  },
  historyMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  historyTextWrap: {
    flex: 1,
  },
  historyEmpty: {
    fontSize: 13,
    color: '#6B7280',
  },
  historyEmptyDark: {
    color: '#94A3B8',
  },
  historyLabel: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  historyLabelDark: {
    color: '#F8FAFC',
  },
  historyMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  historyDescription: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  historyDescriptionDark: {
    color: '#CBD5E1',
  },
  historyValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  historyValueDark: { color: '#E2E8F0' },
  expandText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
});
