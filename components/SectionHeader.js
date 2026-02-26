import { Pressable, StyleSheet, Text, View } from 'react-native';
import palette from '../theme/colors';

export default function SectionHeader({ title, actionLabel, onActionPress, isDarkMode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, isDarkMode ? styles.sectionTitleDark : styles.sectionTitleLight]}>{title}</Text>
      {onActionPress ? (
        <Pressable
          style={[styles.createButton, isDarkMode ? styles.createButtonDark : styles.createButtonLight]}
          onPress={onActionPress}
        >
          <Text style={[styles.createButtonText, isDarkMode ? styles.createButtonTextDark : styles.createButtonTextLight]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: { fontSize: 22, fontWeight: '800' },
  sectionTitleDark: { color: palette.white },
  sectionTitleLight: { color: palette.black },
  createButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: palette.black,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  createButtonDark: { backgroundColor: palette.thunderLime },
  createButtonLight: { backgroundColor: palette.midnightSlate },
  createButtonText: {
    color: palette.white,
    fontWeight: '700',
    fontSize: 12,
  },
  createButtonTextDark: { color: palette.black },
  createButtonTextLight: { color: palette.white },
});
