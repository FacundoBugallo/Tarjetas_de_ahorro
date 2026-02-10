import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Header({ onPress, userName, levelLabel, pointsLabel, isDarkMode, onToggleTheme }) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.header}
      >
        <View>
          <Text style={[styles.greeting, isDarkMode && styles.greetingDark]}>Hola, {userName}</Text>
          <Text style={[styles.level, isDarkMode && styles.levelDark]}>{levelLabel}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{pointsLabel}</Text>
        </View>
      </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  greetingDark: {
    color: '#F8FAFC',
  },
  level: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  levelDark: {
    color: '#94A3B8',
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
