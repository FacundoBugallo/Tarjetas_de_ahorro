import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import DarkButton from './DarkButton';

export default function CreateDebtModal({ visible, onClose, onSubmit }) {
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

    if (
      !name.trim() ||
      Number.isNaN(installment) ||
      Number.isNaN(monthsCount) ||
      installment <= 0 ||
      monthsCount <= 0
    ) {
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.overlay}>
        <LinearGradient
          colors={['rgba(8,9,12,0.98)', 'rgba(24,26,35,0.96)', 'rgba(10,10,14,0.98)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.title}>Nueva tarjeta de deuda</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej: Tarjeta visa"
            style={styles.input}
            placeholderTextColor="#A3A3A3"
          />
          <TextInput
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            placeholder="Pago por periodo (ej: 150)"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#A3A3A3"
          />
          <TextInput
            value={months}
            onChangeText={setMonths}
            placeholder="Meses (ej: 3)"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#A3A3A3"
          />

          <View style={styles.frequencyRow}>
            {['Semanal', 'Mensual'].map((option) => {
              const isActive = frequency === option;
              return (
                <DarkButton
                  key={option}
                  onPress={() => setFrequency(option)}
                  label={option}
                  style={styles.frequencyButtonWrapper}
                  gradientStyle={[styles.frequencyButton, isActive && styles.frequencyButtonActive]}
                  textStyle={styles.frequencyButtonText}
                />
              );
            })}
          </View>

          <View style={styles.actions}>
            <DarkButton
              style={styles.actionButton}
              gradientStyle={styles.modalActionButton}
              textStyle={styles.modalActionText}
              label="Cancelar"
              onPress={onClose}
            />
            <DarkButton
              style={styles.actionButton}
              gradientStyle={styles.modalActionButton}
              textStyle={styles.modalActionText}
              label="Crear deuda"
              onPress={handleCreate}
            />
          </View>
        </LinearGradient>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 18,
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 18,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#FFFFFF',
  },
  frequencyRow: { flexDirection: 'row', gap: 8 },
  frequencyButtonWrapper: { flex: 1 },
  frequencyButton: {
    width: '100%',
    height: 42,
    borderRadius: 10,
  },
  frequencyButtonActive: { borderColor: 'rgba(255,255,255,0.25)' },
  frequencyButtonText: { fontWeight: '600', fontSize: 13 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  actionButton: { flex: 1 },
  modalActionButton: {
    width: '100%',
    height: 44,
    borderRadius: 10,
  },
  modalActionText: { fontWeight: '700', fontSize: 13 },
});
