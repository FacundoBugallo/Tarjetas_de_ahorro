import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Header({ userName, levelLabel, pointsLabel, isDarkMode, onToggleTheme }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, isDarkMode && styles.greetingDark]}>💸 Hola, {userName}</Text>
          <Text style={[styles.level, isDarkMode && styles.levelDark]}>{levelLabel}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{pointsLabel}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onToggleTheme}
        style={[styles.themeButton, isDarkMode && styles.themeButtonDark]}
      >
        <Text style={[styles.themeButtonText, isDarkMode && styles.themeButtonTextDark]}>
          {isDarkMode ? '☀️ Modo claro' : '🌙 Modo oscuro'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
    gap: 10,
  },
  header: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  greetingDark: {
    color: '#F8FAFC',
  },
  level: {
    marginTop: 4,
    fontSize: 14,
    color: '#67E8F9',
  },
  levelDark: {
    color: '#A5F3FC',
  },
  levelBadge: {
    backgroundColor: '#E879F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  levelBadgeText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '800',
  },
  themeButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  themeButtonDark: {
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  themeButtonText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
  },
  themeButtonTextDark: {
    color: '#F8FAFC',
  },
});
