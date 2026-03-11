import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  currencyCode,
  onCurrencyChange,
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
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.backdrop}>
        <LinearGradient
          colors={['rgba(8,9,12,0.98)', 'rgba(24,26,35,0.96)', 'rgba(10,10,14,0.98)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.window}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Resumen del usuario</Text>
            <View style={styles.headerActions}>
              <Pressable onPress={() => setIsEditing((prev) => !prev)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>{isEditing ? 'Cancelar' : 'Editar'}</Text>
              </Pressable>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.body}>
              <View style={styles.row}>
                <Text style={styles.label}>Usuario</Text>
                {isEditing ? (
                  <TextInput value={draftName} onChangeText={setDraftName} style={styles.input} />
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
                <Text style={styles.label}>Moneda de cotización</Text>
                {isEditing ? (
                  <View style={styles.currencyRow}>
                    {["ARS", "USD"].map((currency) => {
                      const isActive = currencyCode === currency;
                      return (
                        <Pressable
                          key={currency}
                          onPress={() => onCurrencyChange(currency)}
                          style={[styles.currencyButton, isActive && styles.currencyButtonActive]}
                        >
                          <Text style={[styles.currencyButtonText, isActive && styles.currencyButtonTextActive]}>
                            {currency}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.value}>{currencyCode}</Text>
                )}
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Destinado a ahorrar</Text>
                {isEditing ? (
                  <TextInput
                    value={draftPlannedInvestment}
                    onChangeText={setDraftPlannedInvestment}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                ) : (
                  <Text style={styles.value}>{formatCurrency(plannedInvestment, currencyCode)}</Text>
                )}
              </View>
              <View style={[styles.row, styles.rowNoDivider]}>
                <Text style={styles.label}>Ahorrado real</Text>
                <Text style={styles.value}>{formatCurrency(actualInvestment, currencyCode)}</Text>
              </View>
            </View>
          </ScrollView>

          {isEditing && (
            <Pressable onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </Pressable>
          )}
        </LinearGradient>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  window: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '86%',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#F9FAFB' },
  secondaryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: { fontSize: 12, fontWeight: '600', color: '#000000' },
  closeButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  closeButtonText: { color: '#000000', fontSize: 12, fontWeight: '600' },
  body: { gap: 2 },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  rowNoDivider: { borderBottomWidth: 0 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderColor: 'rgba(255,255,255,0.2)',
    color: '#F9FAFB',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.4, color: '#E5E7EB' },
  value: { marginTop: 6, fontSize: 16, fontWeight: '600', color: '#F9FAFB' },
  saveButton: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  currencyRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  currencyButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  currencyButtonActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  currencyButtonText: { color: '#F9FAFB', fontWeight: '700' },
  currencyButtonTextActive: { color: '#000000' },
  saveButtonText: { color: '#000000', fontWeight: '700' },
});
