import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SectionHeader({ onCreate, isDarkMode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, isDarkMode ? styles.sectionTitleDark : styles.sectionTitleLight]}>Tus tarjetas de ahorro 💳</Text>
      <TouchableOpacity onPress={onCreate} style={[styles.createButton, isDarkMode ? styles.createButtonDark : styles.createButtonLight]}>
        <Text style={styles.createButtonText}>Crear tarjeta ➕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionTitleDark: { color: '#F8F6F0' },
  sectionTitleLight: { color: '#111111' },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    shadowColor: '#B91C1C',
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  createButtonDark: { backgroundColor: '#DC2626', shadowColor: '#B91C1C' },
  createButtonLight: { backgroundColor: '#000000', shadowColor: '#000000' },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
