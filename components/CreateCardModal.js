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
import { monthDayOptions, weekdayOptions } from '../utils/schedule';

const colorPalette = [
  '#FFFFFF',
  '#E5E7EB',
  '#D4D4D4',
  '#A3A3A3',
  '#737373',
  '#525252',
  '#262626',
  '#000000',
];
const cadenceOptions = ['Diaria', 'Semanal', 'Mensual'];

export default function CreateCardModal({ visible, onClose, onSubmit, isDarkMode }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [cadence, setCadence] = useState('Mensual');
  const [nextContribution, setNextContribution] = useState('');
  const [selectedWeekday, setSelectedWeekday] = useState(5);
  const [selectedMonthDay, setSelectedMonthDay] = useState(26);
  const [selectedColor, setSelectedColor] = useState(colorPalette[0]);

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

    if (!name.trim() || isInvalidNumbers || parsedTarget <= 0 || parsedContribution <= 0 || parsedSaved < 0) {
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
        <View
          style={[styles.sheet, isDarkMode && styles.sheetDark]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.title, isDarkMode && styles.titleDark]}>Crear tarjeta</Text>
            <Pressable onPress={onClose} style={[styles.closeButton, isDarkMode ? styles.actionButtonDark : styles.actionButtonLight]}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.field}>
                <Text style={[styles.label, isDarkMode && styles.labelDark]}>Nombre</Text>
                <TextInput value={name} onChangeText={setName} style={[styles.input, isDarkMode && styles.inputDark]} />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, isDarkMode && styles.labelDark]}>Descripción</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  style={[styles.input, styles.multilineInput, isDarkMode && styles.inputDark]}
                  multiline
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, isDarkMode && styles.labelDark]}>Meta (no puede ser 0)</Text>
                <TextInput
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  keyboardType="numeric"
                  style={[styles.input, isDarkMode && styles.inputDark]}
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, isDarkMode && styles.labelDark]}>Valor inicial</Text>
                <TextInput
                  value={savedAmount}
                  onChangeText={setSavedAmount}
                  keyboardType="numeric"
                  style={[styles.input, isDarkMode && styles.inputDark]}
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, isDarkMode && styles.labelDark]}>Cadencia</Text>
                <View style={styles.optionRow}>
                  {cadenceOptions.map((option) => {
                    const isActive = cadence === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setCadence(option)}
                        style={[
                          styles.optionButton,
                          isDarkMode && styles.optionButtonDark,
                          isActive && styles.optionButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isDarkMode && styles.optionTextDark,
                            isActive && styles.optionTextActive,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {cadence === 'Semanal' && (
                <View style={styles.field}>
                  <Text style={[styles.label, isDarkMode && styles.labelDark]}>¿Qué día aportas cada semana?</Text>
                  <View style={styles.optionRow}>
                    {weekdayOptions.map((option) => {
                      const isActive = selectedWeekday === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => setSelectedWeekday(option.value)}
                          style={[
                            styles.optionButton,
                            isDarkMode && styles.optionButtonDark,
                            isActive && styles.optionButtonActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              isDarkMode && styles.optionTextDark,
                              isActive && styles.optionTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
              )}

              {cadence === 'Mensual' && (
                <View style={styles.field}>
                  <Text style={[styles.label, isDarkMode && styles.labelDark]}>¿Qué fecha aportas cada mes?</Text>
                  <View style={styles.optionRow}>
                    {monthDayOptions.map((day) => {
                      const isActive = selectedMonthDay === day;
                      return (
                        <Pressable
                          key={day}
                          onPress={() => setSelectedMonthDay(day)}
                          style={[
                            styles.dayButton,
                            isDarkMode && styles.dayButtonDark,
                            isActive && styles.optionButtonActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              isDarkMode && styles.optionTextDark,
                              isActive && styles.optionTextActive,
                            ]}
                          >
                            {day}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
              )}

              <View style={styles.field}>
                <Text style={[styles.label, isDarkMode && styles.labelDark]}>Próximo aporte (no puede ser 0)</Text>
                <TextInput
                  value={nextContribution}
                  onChangeText={setNextContribution}
                  keyboardType="numeric"
                  style={[styles.input, isDarkMode && styles.inputDark]}
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, isDarkMode && styles.labelDark]}>Color</Text>
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
          <Pressable onPress={handleSubmit} style={[styles.saveButton, isDarkMode ? styles.actionButtonDark : styles.actionButtonLight]}>
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
    maxHeight: '88%',
  },
  sheetDark: {
    backgroundColor: '#111111',
  },
  content: { gap: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  titleDark: { color: '#F8F6F0' },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  closeButtonText: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonDark: { backgroundColor: '#DC2626' },
  actionButtonLight: { backgroundColor: '#000000' },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#000000',
  },
  labelDark: { color: '#737373' },
  input: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  inputDark: {
    borderColor: '#404040',
    color: '#F8F6F0',
    backgroundColor: '#111827',
  },
  multilineInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  optionButtonDark: {
    borderColor: '#404040',
  },
  dayButton: {
    width: 36,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 999,
    paddingVertical: 6,
    alignItems: 'center',
  },
  dayButtonDark: {
    borderColor: '#404040',
  },
  optionButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  optionText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
  optionTextDark: { color: '#D4D4D4' },
  optionTextActive: {
    color: '#FFFFFF',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  saveButton: {
    marginTop: 6,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
