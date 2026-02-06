import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { formatCurrency } from '../utils/formatters';

export default function UserSummaryModal({
  visible,
  onClose,
  userName,
  levelLabel,
  incomeStatus,
  monthlyIncome,
  availableMonthly,
  onSave,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(userName);
  const [draftLevel, setDraftLevel] = useState(levelLabel);
  const [draftIncomeStatus, setDraftIncomeStatus] = useState(incomeStatus);
  const [draftMonthlyIncome, setDraftMonthlyIncome] = useState(
    monthlyIncome.toString(),
  );

  useEffect(() => {
    if (visible) {
      setDraftName(userName);
      setDraftLevel(levelLabel);
      setDraftIncomeStatus(incomeStatus);
      setDraftMonthlyIncome(monthlyIncome.toString());
      setIsEditing(false);
    }
  }, [visible, userName, levelLabel, incomeStatus, monthlyIncome]);

  const handleSave = () => {
    const parsedIncome = Number(draftMonthlyIncome);
    onSave({
      userName: draftName.trim() || userName,
      levelLabel: draftLevel.trim() || levelLabel,
      incomeStatus: draftIncomeStatus.trim() || incomeStatus,
      monthlyIncome: Number.isNaN(parsedIncome)
        ? monthlyIncome
        : parsedIncome,
    });
    setIsEditing(false);
  };

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
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => setIsEditing((prev) => !prev)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Text>
              </Pressable>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Usuario</Text>
            {isEditing ? (
              <TextInput
                value={draftName}
                onChangeText={setDraftName}
                style={styles.input}
              />
            ) : (
              <Text style={styles.value}>{userName}</Text>
            )}
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nivel</Text>
            {isEditing ? (
              <TextInput
                value={draftLevel}
                onChangeText={setDraftLevel}
                style={styles.input}
              />
            ) : (
              <Text style={styles.value}>{levelLabel}</Text>
            )}
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nivel de ingresos</Text>
            {isEditing ? (
              <TextInput
                value={draftIncomeStatus}
                onChangeText={setDraftIncomeStatus}
                style={styles.input}
              />
            ) : (
              <Text style={styles.value}>{incomeStatus}</Text>
            )}
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sueldo mensual</Text>
            {isEditing ? (
              <TextInput
                value={draftMonthlyIncome}
                onChangeText={setDraftMonthlyIncome}
                keyboardType="numeric"
                style={styles.input}
              />
            ) : (
              <Text style={styles.value}>{formatCurrency(monthlyIncome)}</Text>
            )}
          </View>
          <View style={[styles.row, styles.rowNoDivider]}>
            <Text style={styles.label}>Disponible por mes</Text>
            <Text style={styles.value}>{formatCurrency(availableMonthly)}</Text>
          </View>
          {isEditing && (
            <Pressable onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </Pressable>
          )}
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
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
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
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
  saveButton: {
    marginTop: 4,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
