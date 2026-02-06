import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../utils/formatters';

export default function UserSummaryModal({
  visible,
  onClose,
  userName,
  levelLabel,
  incomeStatus,
  availableMonthly,
}) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} style={styles.backdrop}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Resumen del usuario</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </Pressable>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Usuario</Text>
            <Text style={styles.value}>{userName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nivel</Text>
            <Text style={styles.value}>{levelLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nivel de ingresos</Text>
            <Text style={styles.value}>{incomeStatus}</Text>
          </View>
          <View style={[styles.row, styles.rowNoDivider]}>
            <Text style={styles.label}>Disponible por mes</Text>
            <Text style={styles.value}>{formatCurrency(availableMonthly)}</Text>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    backgroundColor: '#111827',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  closeButtonText: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowNoDivider: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: '#6B7280',
  },
  value: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
