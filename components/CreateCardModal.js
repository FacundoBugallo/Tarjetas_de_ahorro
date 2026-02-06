import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const colorPalette = ['#FFE9D2', '#E2F4FF', '#EFE6FF', '#DCFCE7', '#FCE7F3'];

const getNextColor = (index) => colorPalette[index % colorPalette.length];

export default function CreateCardModal({ visible, onClose, onSubmit, index }) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [cadence, setCadence] = useState('Mensual');
  const [nextContribution, setNextContribution] = useState('');

  useEffect(() => {
    if (visible) {
      setName('');
      setTargetAmount('');
      setSavedAmount('');
      setCadence('Mensual');
      setNextContribution('');
    }
  }, [visible]);

  const handleSubmit = () => {
    const parsedTarget = Number(targetAmount);
    const parsedSaved = Number(savedAmount || 0);
    const parsedContribution = Number(nextContribution);

    if (!name.trim() || Number.isNaN(parsedTarget) || Number.isNaN(parsedContribution)) {
      return;
    }

    onSubmit({
      id: `card-${Date.now()}`,
      name: name.trim(),
      targetAmount: parsedTarget,
      savedAmount: Number.isNaN(parsedSaved) ? 0 : parsedSaved,
      cadence: cadence.trim() || 'Mensual',
      nextContribution: parsedContribution,
      color: getNextColor(index),
    });
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
            <Text style={styles.title}>Crear tarjeta</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Meta</Text>
            <TextInput
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Ahorrado</Text>
            <TextInput
              value={savedAmount}
              onChangeText={setSavedAmount}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Cadencia</Text>
            <TextInput value={cadence} onChangeText={setCadence} style={styles.input} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Próximo aporte</Text>
            <TextInput
              value={nextContribution}
              onChangeText={setNextContribution}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <Pressable onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Agregar tarjeta</Text>
          </Pressable>
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
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: '#6B7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
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
