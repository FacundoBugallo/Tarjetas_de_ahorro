import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../utils/formatters';

export default function HistoryCard({ items = [], isDarkMode, currencyCode }) {
  const [expandedItems, setExpandedItems] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleItem = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={[styles.historyCard, isDarkMode ? styles.historyCardDark : styles.historyCardLight]}>
      <Pressable style={styles.headerRow} onPress={() => setIsCollapsed((prev) => !prev)}>
        <Text style={[styles.historyTitle, isDarkMode ? styles.historyTitleDark : styles.historyTitleLight]}>Historial</Text>
        <Text style={styles.collapseText}>{isCollapsed ? 'Mostrar' : 'Minimizar'}</Text>
      </Pressable>

      {isCollapsed ? null : items.length === 0 ? (
        <Text style={[styles.historyEmpty, isDarkMode && styles.historyEmptyDark]}>
          Aún no hay metas completadas.
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
                  <Text style={styles.historyMeta}>Meta: {formatCurrency(item.targetAmount, currencyCode)}</Text>
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
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  historyCardDark: {
    backgroundColor: '#000000',
    borderColor: '#B91C1C',
  },
  historyCardLight: {
    backgroundColor: '#F8F6F0',
    borderColor: '#FECACA',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  historyTitleDark: { color: '#F8F6F0' },
  historyTitleLight: { color: '#111111' },
  collapseText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 12,
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 4,
  },
  historyItemDark: {
    borderBottomColor: '#1E293B',
  },
  historyMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  historyTextWrap: { flex: 1 },
  historyEmpty: { fontSize: 13, color: '#404040' },
  historyEmptyDark: { color: '#737373' },
  historyLabel: { fontSize: 13, color: '#111111', fontWeight: '600' },
  historyLabelDark: { color: '#F8F6F0' },
  historyMeta: { marginTop: 4, fontSize: 12, color: '#EF4444' },
  historyDescription: { fontSize: 12, color: '#404040', lineHeight: 18 },
  historyDescriptionDark: { color: '#D4D4D4' },
  historyValue: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
  historyValueDark: { color: '#FCA5A5' },
  expandText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
});
