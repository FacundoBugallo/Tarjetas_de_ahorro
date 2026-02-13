import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Header({
  userName,
  levelLabel,
  pointsLabel,
  profilePhoto,
  isDarkMode,
  onToggleTheme,
}) {
  const userInitial = userName?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <View style={styles.wrapper}>
      <View style={[styles.header, isDarkMode ? styles.headerDark : styles.headerLight]}>
        <View style={styles.marbleOrbLarge} />
        <View style={styles.marbleOrbSmall} />

        <View style={styles.headerTopRow}>
          <View style={styles.userBlock}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarFallbackText}>{userInitial}</Text>
              </View>
            )}

            <View>
              <Text style={[styles.greeting, isDarkMode ? styles.greetingDark : styles.greetingLight]}>Hola, {userName} 👋</Text>
              <Text style={[styles.level, isDarkMode ? styles.levelDark : styles.levelLight]}>{levelLabel}</Text>
            </View>
          </View>

          <View style={[styles.pointsPill, isDarkMode ? styles.pointsPillDark : styles.pointsPillLight]}>
            <Text style={[styles.pointsPillLabel, isDarkMode ? styles.pointsPillLabelDark : styles.pointsPillLabelLight]}>
              Puntos
            </Text>
            <Text style={[styles.pointsPillValue, isDarkMode ? styles.pointsPillValueDark : styles.pointsPillValueLight]}>
              {pointsLabel}
            </Text>
          </View>
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
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  headerDark: {
    backgroundColor: '#0B0B0B',
    borderWidth: 1,
    borderColor: '#2E2E2E',
  },
  headerLight: {
    backgroundColor: '#E8E8E8',
    borderWidth: 1,
    borderColor: '#CFCFCF',
  },
  marbleOrbLarge: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -95,
    right: -35,
  },
  marbleOrbSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -55,
    left: -20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  userBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  greeting: { fontSize: 20, fontWeight: '700' },
  greetingDark: { color: '#F5F5F5' },
  greetingLight: { color: '#111111' },
  level: { marginTop: 2, fontSize: 13, fontWeight: '600' },
  levelDark: { color: '#D4D4D4' },
  levelLight: { color: '#2A2A2A' },
  pointsPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    minWidth: 82,
  },
  pointsPillDark: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  pointsPillLight: {
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#BFBFBF',
  },
  pointsPillLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pointsPillLabelDark: { color: '#A3A3A3' },
  pointsPillLabelLight: { color: '#4A4A4A' },
  pointsPillValue: { marginTop: 2, fontSize: 14, fontWeight: '800' },
  pointsPillValueDark: { color: '#FFFFFF' },
  pointsPillValueLight: { color: '#111111' },
  themeButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  themeButtonDark: { borderColor: '#4D4D4D', backgroundColor: '#000000' },
  themeButtonLight: { borderColor: '#D1D1D1', backgroundColor: '#F5F5F5' },
  themeButtonText: { fontSize: 12, fontWeight: '700' },
  themeButtonTextDark: { color: '#FFFFFF' },
  themeButtonTextLight: { color: '#000000' },
});
