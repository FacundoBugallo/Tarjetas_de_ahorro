import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

export default function CreateDebtModal({ visible, onClose, onSubmit, isDarkMode }) {
  const [name, setName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [months, setMonths] = useState('');
  const [frequency, setFrequency] = useState('Mensual');

  const clearForm = () => {
    setName('');
    setPaymentAmount('');
    setMonths('');
    setFrequency('Mensual');
  };

  const handleCreate = () => {
    const installment = Number(paymentAmount);
    const monthsCount = Number(months);

    if (!name.trim() || Number.isNaN(installment) || Number.isNaN(monthsCount) || installment <= 0 || monthsCount <= 0) {
      return;
    }

    onSubmit({
      id: `debt-${Date.now()}`,
      name: name.trim(),
      paymentAmount: installment,
      months: monthsCount,
      totalToPay: installment * monthsCount,
      paidAmount: 0,
      nextContribution: installment,
      cadence: frequency,
      color: '#111111',
    });

    clearForm();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.title, isDarkMode ? styles.titleDark : styles.titleLight]}>Nueva tarjeta de deuda</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej: Tarjeta visa"
            style={[styles.input, isDarkMode && styles.inputDark]}
            placeholderTextColor={isDarkMode ? '#A3A3A3' : '#737373'}
          />
          <TextInput
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            placeholder="Pago por periodo (ej: 150)"
            keyboardType="numeric"
            style={[styles.input, isDarkMode && styles.inputDark]}
            placeholderTextColor={isDarkMode ? '#A3A3A3' : '#737373'}
          />
          <TextInput
            value={months}
            onChangeText={setMonths}
            placeholder="Meses (ej: 3)"
            keyboardType="numeric"
            style={[styles.input, isDarkMode && styles.inputDark]}
            placeholderTextColor={isDarkMode ? '#A3A3A3' : '#737373'}
          />

          <View style={styles.frequencyRow}>
            {['Semanal', 'Mensual'].map((option) => {
              const isActive = frequency === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setFrequency(option)}
                  style={[styles.frequencyButton, isActive && styles.frequencyButtonActive]}
                >
                  <Text style={[styles.frequencyButtonText, isActive && styles.frequencyButtonTextActive]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={handleCreate}>
              <Text style={styles.primaryButtonText}>Crear deuda</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardDark: { backgroundColor: '#090909', borderColor: '#303030' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#D1D1D1' },
  title: { fontSize: 18, fontWeight: '800' },
  titleDark: { color: '#FFFFFF' },
  titleLight: { color: '#111111' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    color: '#111111',
  },
  inputDark: {
    borderColor: '#404040',
    backgroundColor: '#141414',
    color: '#FFFFFF',
  },
  frequencyRow: { flexDirection: 'row', gap: 8 },
  frequencyButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  frequencyButtonActive: { backgroundColor: '#111111', borderColor: '#111111' },
  frequencyButtonText: { color: '#111111', fontWeight: '600' },
  frequencyButtonTextActive: { color: '#FFFFFF' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: '#111111',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#111111',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryButtonText: { color: '#111111', fontWeight: '700' },
});
