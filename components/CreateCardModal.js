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
import DarkButton from './DarkButton';
import { monthDayOptions, weekdayOptions } from '../utils/schedule';

const colorPalette = [
  '#FFFFFF',
  '#F59E0B',
  '#3B82F6',
  '#22C55E',
  '#EC4899',
  '#A855F7',
  '#14B8A6',
  '#EF4444',
  '#000000',
];
const cadenceOptions = ['Diaria', 'Semanal', 'Mensual'];
const savingsTypeOptions = ['Emergencia', 'Viaje', 'Hogar', 'Educación', 'Inversión'];

export default function CreateCardModal({ visible, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [cadence, setCadence] = useState('Mensual');
  const [nextContribution, setNextContribution] = useState('');
  const [selectedWeekday, setSelectedWeekday] = useState(5);
  const [selectedMonthDay, setSelectedMonthDay] = useState(26);
  const [selectedColor, setSelectedColor] = useState(colorPalette[0]);
  const [savingType, setSavingType] = useState(savingsTypeOptions[0]);

  useEffect(() => {
    if (visible) {
      setName('');
      setDescription('');
      setTargetAmount('');
      setSavedAmount('');
      setCadence('Mensual');
      setNextContribution('');
      setSelectedWeekday(5);
      setSelectedMonthDay(26);
      setSelectedColor(colorPalette[0]);
      setSavingType(savingsTypeOptions[0]);
    }
  }, [visible]);

  const handleSubmit = () => {
    const parsedTarget = Number(targetAmount);
    const parsedSaved = Number(savedAmount || 0);
    const parsedContribution = Number(nextContribution);

    const isInvalidNumbers =
      Number.isNaN(parsedTarget) ||
      Number.isNaN(parsedSaved) ||
      Number.isNaN(parsedContribution);

    if (
      !name.trim() ||
      isInvalidNumbers ||
      parsedTarget <= 0 ||
      parsedContribution <= 0 ||
      parsedSaved < 0
    ) {
      return;
    }

    onSubmit({
      id: `card-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      targetAmount: parsedTarget,
      savedAmount: parsedSaved,
      cadence: cadence.trim() || 'Mensual',
      contributionWeekday: cadence === 'Semanal' ? selectedWeekday : undefined,
      contributionMonthDay: cadence === 'Mensual' ? selectedMonthDay : undefined,
      nextContribution: parsedContribution,
      color: selectedColor,
      savingType,
    });
  };

  const canSubmit =
    name.trim() &&
    Number(targetAmount) > 0 &&
    Number(nextContribution) > 0 &&
    Number(savedAmount || 0) >= 0;

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
            <Text style={styles.title}>Crear tarjeta</Text>
            <DarkButton
              onPress={onClose}
              label="Cerrar"
              style={styles.closeButtonWrapper}
              gradientStyle={styles.closeButton}
              textStyle={styles.closeButtonText}
            />
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.field}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput value={name} onChangeText={setName} style={styles.input} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  style={[styles.input, styles.multilineInput]}
                  multiline
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Meta (no puede ser 0)</Text>
                <TextInput
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Valor inicial</Text>
                <TextInput
                  value={savedAmount}
                  onChangeText={setSavedAmount}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Cadencia</Text>
                <View style={styles.optionRow}>
                  {cadenceOptions.map((option) => {
                    const isActive = cadence === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setCadence(option)}
                        style={[styles.optionButton, isActive && styles.optionButtonActive]}
                      >
                        <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {cadence === 'Semanal' && (
                <View style={styles.field}>
                  <Text style={styles.label}>¿Qué día aportas cada semana?</Text>
                  <View style={styles.optionRow}>
                    {weekdayOptions.map((option) => {
                      const isActive = selectedWeekday === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => setSelectedWeekday(option.value)}
                          style={[styles.optionButton, isActive && styles.optionButtonActive]}
                        >
                          <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {cadence === 'Mensual' && (
                <View style={styles.field}>
                  <Text style={styles.label}>¿Qué fecha aportas cada mes?</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.monthDaysRow}
                  >
                    {monthDayOptions.map((day) => {
                      const isActive = selectedMonthDay === day;
                      return (
                        <Pressable
                          key={day}
                          onPress={() => setSelectedMonthDay(day)}
                          style={[styles.dayButton, isActive && styles.optionButtonActive]}
                        >
                          <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                            {day}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>Próximo aporte (no puede ser 0)</Text>
                <TextInput
                  value={nextContribution}
                  onChangeText={setNextContribution}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Tipo de ahorro</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typesRow}>
                  {savingsTypeOptions.map((option) => {
                    const isActive = savingType === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setSavingType(option)}
                        style={[styles.optionButton, isActive && styles.optionButtonActive]}
                      >
                        <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{option}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Color</Text>
                <View style={styles.colorRow}>
                  {colorPalette.map((color) => {
                    const isActive = selectedColor === color;
                    return (
                      <Pressable
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: color },
                          isActive && styles.colorSwatchActive,
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            </View>
          </ScrollView>
          <DarkButton
            onPress={handleSubmit}
            label="Agregar tarjeta"
            gradientStyle={styles.saveButton}
            textStyle={styles.saveButtonText}
            disabled={!canSubmit}
          />
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
    maxHeight: '88%',
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
  content: { gap: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButtonWrapper: { minWidth: 110 },
  closeButton: { width: '100%', height: 36, borderRadius: 999 },
  closeButtonText: { fontSize: 12, fontWeight: '600' },
  field: { gap: 6 },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#E5E7EB',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  multilineInput: { minHeight: 64, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  monthDaysRow: { gap: 8, paddingRight: 8 },
  typesRow: { gap: 8, paddingRight: 8 },
  optionButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  dayButton: {
    width: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  optionButtonActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  optionText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  optionTextActive: { color: '#000000' },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorSwatchActive: { borderColor: '#FFFFFF', borderWidth: 2 },
  saveButton: { marginTop: 8, width: '100%', height: 48, borderRadius: 14 },
  saveButtonText: { fontWeight: '600', fontSize: 14 },
});
