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
      <Text style={[styles.historyTitle, isDarkMode && styles.historyTitleDark]}>🧾 Historial</Text>
      {items.length === 0 ? (
        <Text style={[styles.historyEmpty, isDarkMode && styles.historyEmptyDark]}>
          Aún no hay metas completadas 🚀
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
    backgroundColor: '#0B1120',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1D4ED8',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  historyCardDark: {
    backgroundColor: '#111827',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
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
    color: '#A5F3FC',
  },
  historyEmptyDark: {
    color: '#94A3B8',
  },
  historyLabel: {
    fontSize: 13,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  historyLabelDark: {
    color: '#F8FAFC',
  },
  historyMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#67E8F9',
  },
  historyDescription: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  historyDescriptionDark: {
    color: '#CBD5E1',
  },
  historyValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F0ABFC',
  },
  historyValueDark: { color: '#E2E8F0' },
  expandText: {
    fontSize: 12,
    color: '#22D3EE',
    fontWeight: '600',
  },
});
