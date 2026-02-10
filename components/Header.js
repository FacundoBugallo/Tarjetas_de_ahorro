import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Header({ userName, levelLabel, pointsLabel, isDarkMode, onToggleTheme }) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.header, isDarkMode ? styles.headerDark : styles.headerLight]}>
        <View>
          <Text style={[styles.greeting, isDarkMode ? styles.greetingDark : styles.greetingLight]}>Hola, {userName} 👋</Text>
          <Text style={[styles.level, isDarkMode ? styles.levelDark : styles.levelLight]}>{levelLabel}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{pointsLabel}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onToggleTheme}
        style={[styles.themeButton, isDarkMode ? styles.themeButtonDark : styles.themeButtonLight]}
      >
        <Text style={[styles.themeButtonText, isDarkMode ? styles.themeButtonTextDark : styles.themeButtonTextLight]}>
          {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20, gap: 10 },
  header: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  headerDark: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#B91C1C',
  },
  headerLight: {
    backgroundColor: '#F8F6F0',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  greeting: { fontSize: 22, fontWeight: '700' },
  greetingDark: { color: '#F8F6F0' },
  greetingLight: { color: '#111111' },
  level: { marginTop: 4, fontSize: 14 },
  levelDark: { color: '#FCA5A5' },
  levelLight: { color: '#DC2626' },
  levelBadge: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  levelBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  themeButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  themeButtonDark: { borderColor: '#B91C1C', backgroundColor: '#000000' },
  themeButtonLight: { borderColor: '#FCA5A5', backgroundColor: '#FFFFFF' },
  themeButtonText: { fontSize: 12, fontWeight: '700' },
  themeButtonTextDark: { color: '#FEE2E2' },
  themeButtonTextLight: { color: '#B91C1C' },
});
