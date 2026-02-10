import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SectionHeader({ onCreate, isDarkMode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>🪙 Tus tarjetas de ahorro</Text>
      <TouchableOpacity onPress={onCreate} style={styles.createButton}>
        <Text style={styles.createButtonText}>➕ Crear tarjeta</Text>
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
    color: '#E2E8F0',
  },
  sectionTitleDark: { color: '#F8FAFC' },
  createButton: {
    backgroundColor: '#D946EF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    shadowColor: '#D946EF',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
