import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SectionHeader({ onCreate, isDarkMode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Tus tarjetas de ahorro</Text>
      <TouchableOpacity onPress={onCreate} style={styles.createButton}>
        <Text style={styles.createButtonText}>Crear tarjeta</Text>
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
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionTitleDark: { color: '#F8FAFC' },
  createButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
