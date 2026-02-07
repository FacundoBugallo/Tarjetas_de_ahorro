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
  pointsLabel,
  incomeStatus,
  monthlyIncome,
  availableMonthly,
  onSave,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(userName);
  const [draftIncomeStatus, setDraftIncomeStatus] = useState(incomeStatus);
  const [draftMonthlyIncome, setDraftMonthlyIncome] = useState(
    monthlyIncome.toString(),
  );
  const incomeOptions = [
    'Ingresos fijo',
    'Estimado por comisión',
    'Estimado por monotributo',
  ];

  useEffect(() => {
    if (visible) {
      setDraftName(userName);
      setDraftIncomeStatus(incomeStatus);
      setDraftMonthlyIncome(monthlyIncome.toString());
      setIsEditing(false);
    }
  }, [visible, userName, incomeStatus, monthlyIncome]);

  const handleSave = () => {
    const parsedIncome = Number(draftMonthlyIncome);
    onSave({
      userName: draftName.trim() || userName,
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
            <Text style={styles.value}>{levelLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Puntos</Text>
            <Text style={styles.value}>{pointsLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nivel de ingresos</Text>
            {isEditing ? (
              <View style={styles.optionRow}>
                {incomeOptions.map((option) => {
                  const isActive = draftIncomeStatus === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setDraftIncomeStatus(option)}
                      style={[
                        styles.optionButton,
                        isActive && styles.optionButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isActive && styles.optionTextActive,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
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
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111827',
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
    color: '#F9FAFB',
  },
  secondaryButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  secondaryButtonText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#2563EB',
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
    borderBottomColor: '#1F2937',
  },
  rowNoDivider: {
    borderBottomWidth: 0,
  },
  optionRow: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  optionButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  optionText: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#F9FAFB',
    backgroundColor: '#0F172A',
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: '#9CA3AF',
  },
  value: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
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
