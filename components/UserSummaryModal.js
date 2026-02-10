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

const incomeOptions = ['Ingresos fijo', 'Ingresos variables'];

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
  isDarkMode,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(userName);
  const [draftIncomeStatus, setDraftIncomeStatus] = useState(incomeStatus);
  const [draftMonthlyIncome, setDraftMonthlyIncome] = useState(
    String(monthlyIncome),
  );

  useEffect(() => {
    if (visible) {
      setIsEditing(false);
      setDraftName(userName);
      setDraftIncomeStatus(incomeStatus);
      setDraftMonthlyIncome(String(monthlyIncome));
    }
  }, [visible, userName, incomeStatus, monthlyIncome]);

  const handleSave = () => {
    const parsedMonthlyIncome = Number(draftMonthlyIncome);

    if (!draftName.trim() || Number.isNaN(parsedMonthlyIncome)) {
      return;
    }

    onSave({
      userName: draftName.trim(),
      incomeStatus: draftIncomeStatus,
      monthlyIncome: parsedMonthlyIncome,
    });

    setIsEditing(false);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} style={styles.backdrop}>
        <View style={[styles.sheet, isDarkMode ? styles.sheetDark : styles.sheetLight]} onStartShouldSetResponder={() => true}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, isDarkMode ? styles.titleDark : styles.titleLight]}>Resumen del usuario</Text>
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => setIsEditing((prev) => !prev)}
                style={[styles.secondaryButton, isDarkMode ? styles.secondaryButtonDark : styles.secondaryButtonLight]}
              >
                <Text style={[styles.secondaryButtonText, isDarkMode ? styles.secondaryButtonTextDark : styles.secondaryButtonTextLight]}>
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Text>
              </Pressable>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.row, isDarkMode ? styles.rowDark : styles.rowLight]}>
            <Text style={[styles.label, isDarkMode ? styles.labelDark : styles.labelLight]}>Usuario</Text>
            {isEditing ? (
              <TextInput
                value={draftName}
                onChangeText={setDraftName}
                style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
              />
            ) : (
              <Text style={[styles.value, isDarkMode ? styles.valueDark : styles.valueLight]}>{userName}</Text>
            )}
          </View>
          <View style={[styles.row, isDarkMode ? styles.rowDark : styles.rowLight]}>
            <Text style={[styles.label, isDarkMode ? styles.labelDark : styles.labelLight]}>Nivel</Text>
            <Text style={[styles.value, isDarkMode ? styles.valueDark : styles.valueLight]}>{levelLabel}</Text>
          </View>
          <View style={[styles.row, isDarkMode ? styles.rowDark : styles.rowLight]}>
            <Text style={[styles.label, isDarkMode ? styles.labelDark : styles.labelLight]}>Puntos</Text>
            <Text style={[styles.value, isDarkMode ? styles.valueDark : styles.valueLight]}>{pointsLabel}</Text>
          </View>
          <View style={[styles.row, isDarkMode ? styles.rowDark : styles.rowLight]}>
            <Text style={[styles.label, isDarkMode ? styles.labelDark : styles.labelLight]}>Nivel de ingresos</Text>
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
                        isDarkMode ? styles.optionButtonDark : styles.optionButtonLight,
                        isActive && styles.optionButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isDarkMode ? styles.optionTextDark : styles.optionTextLight,
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
              <Text style={[styles.value, isDarkMode ? styles.valueDark : styles.valueLight]}>{incomeStatus}</Text>
            )}
          </View>
          <View style={[styles.row, isDarkMode ? styles.rowDark : styles.rowLight]}>
            <Text style={[styles.label, isDarkMode ? styles.labelDark : styles.labelLight]}>Sueldo mensual</Text>
            {isEditing ? (
              <TextInput
                value={draftMonthlyIncome}
                onChangeText={setDraftMonthlyIncome}
                keyboardType="numeric"
                style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
              />
            ) : (
              <Text style={[styles.value, isDarkMode ? styles.valueDark : styles.valueLight]}>{formatCurrency(monthlyIncome)}</Text>
            )}
          </View>
          <View style={[styles.row, styles.rowNoDivider]}>
            <Text style={[styles.label, isDarkMode ? styles.labelDark : styles.labelLight]}>Disponible por mes</Text>
            <Text style={[styles.value, isDarkMode ? styles.valueDark : styles.valueLight]}>{formatCurrency(availableMonthly)}</Text>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
  },
  sheetDark: { backgroundColor: '#111827' },
  sheetLight: { backgroundColor: '#FFFFFF' },
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
  },
  titleDark: { color: '#F9FAFB' },
  titleLight: { color: '#111827' },
  secondaryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  secondaryButtonDark: { backgroundColor: '#1F2937' },
  secondaryButtonLight: { backgroundColor: '#E5E7EB' },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButtonTextDark: { color: '#E5E7EB' },
  secondaryButtonTextLight: { color: '#111827' },
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
  },
  rowDark: { borderBottomColor: '#1F2937' },
  rowLight: { borderBottomColor: '#E5E7EB' },
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
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  optionButtonDark: { borderColor: '#374151' },
  optionButtonLight: { borderColor: '#CBD5E1' },
  optionButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionTextDark: { color: '#E5E7EB' },
  optionTextLight: { color: '#334155' },
  optionTextActive: {
    color: '#FFFFFF',
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  inputDark: {
    borderColor: '#374151',
    color: '#F9FAFB',
    backgroundColor: '#0F172A',
  },
  inputLight: {
    borderColor: '#CBD5E1',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  labelDark: { color: '#9CA3AF' },
  labelLight: { color: '#64748B' },
  value: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
  },
  valueDark: { color: '#F9FAFB' },
  valueLight: { color: '#111827' },
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
