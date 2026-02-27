import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function DarkButton({
  label,
  onPress,
  style,
  textStyle,
  gradientStyle,
  disabled = false,
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.wrapper, style, disabled && styles.disabled]}>
      <View style={[styles.darkButton, gradientStyle]}>
        <Text style={[styles.darkText, textStyle]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkButton: {
    width: 180,
    height: 60,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B1B1F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  darkText: {
    color: '#F2F2F7',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.65,
  },
});
