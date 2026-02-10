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
  plannedInvestment,
  actualInvestment,
  onSave,
  isDarkMode,
  currencyCode,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(userName);
  const [draftPlannedInvestment, setDraftPlannedInvestment] = useState(String(plannedInvestment));

  useEffect(() => {
    if (visible) {
      setIsEditing(false);
      setDraftName(userName);
      setDraftPlannedInvestment(String(plannedInvestment));
    }
  }, [visible, userName, plannedInvestment]);

  const handleSave = () => {
    const parsedPlannedInvestment = Number(draftPlannedInvestment);

    if (!draftName.trim() || Number.isNaN(parsedPlannedInvestment) || parsedPlannedInvestment < 0) {
      return;
    }

    onSave({
      userName: draftName.trim(),
      plannedInvestment: parsedPlannedInvestment,
    });

    setIsEditing(false);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
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
            <Text style={[styles.label, isDarkMode ? styles.labelDark : styles.labelLight]}>Destinado a ahorrar</Text>
            {isEditing ? (
              <TextInput
                value={draftPlannedInvestment}
                onChangeText={setDraftPlannedInvestment}
                keyboardType="numeric"
                style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
              />
            ) : (
              <Text style={[styles.value, isDarkMode ? styles.valueDark : styles.valueLight]}>{formatCurrency(plannedInvestment, currencyCode)}</Text>
            )}
          </View>
          <View style={[styles.row, styles.rowNoDivider]}>
            <Text style={[styles.label, isDarkMode ? styles.labelDark : styles.labelLight]}>Ahorrado real</Text>
            <Text style={[styles.value, isDarkMode ? styles.valueDark : styles.valueLight]}>{formatCurrency(actualInvestment, currencyCode)}</Text>
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
  sheetDark: { backgroundColor: '#000000' },
  sheetLight: { backgroundColor: '#FFFFFF' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  titleDark: { color: '#F9FAFB' },
  titleLight: { color: '#111827' },
  secondaryButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  secondaryButtonDark: { backgroundColor: '#1E293B' },
  secondaryButtonLight: { backgroundColor: '#E5E7EB' },
  secondaryButtonText: { fontSize: 12, fontWeight: '600' },
  secondaryButtonTextDark: { color: '#E5E7EB' },
  secondaryButtonTextLight: { color: '#B91C1C' },
  closeButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  closeButtonText: { color: '#F9FAFB', fontSize: 12, fontWeight: '600' },
  row: { paddingVertical: 10, borderBottomWidth: 1 },
  rowDark: { borderBottomColor: '#1E293B' },
  rowLight: { borderBottomColor: '#E5E7EB' },
  rowNoDivider: { borderBottomWidth: 0 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  inputDark: { borderColor: '#B91C1C', color: '#F9FAFB', backgroundColor: '#111111' },
  inputLight: { borderColor: '#D4D4D4', color: '#111827', backgroundColor: '#FFFFFF' },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.4 },
  labelDark: { color: '#FCA5A5' },
  labelLight: { color: '#525252' },
  value: { marginTop: 6, fontSize: 16, fontWeight: '600' },
  valueDark: { color: '#F9FAFB' },
  valueLight: { color: '#111827' },
  saveButton: {
    marginTop: 4,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700' },
});
