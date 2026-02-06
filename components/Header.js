import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Header({ onPress, userName, levelLabel, pointsLabel }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.header}
    >
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hola, {userName}</Text>
        <Text style={styles.level}>{levelLabel}</Text>
      </View>
      <View style={styles.levelBadge}>
        <Text style={styles.levelBadgeText}>{pointsLabel}</Text>
      </View>
    </TouchableOpacity>
      <TouchableOpacity onPress={onPress} style={styles.levelBadge}>
        <Text style={styles.levelBadgeText}>{pointsLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  level: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  levelBadge: {
    backgroundColor: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  levelBadgeText: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '600',
  },
});
