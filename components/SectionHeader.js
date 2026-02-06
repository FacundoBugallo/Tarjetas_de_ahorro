import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SectionHeader() {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Tus tarjetas de ahorro</Text>
      <TouchableOpacity style={styles.createButton}>
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
