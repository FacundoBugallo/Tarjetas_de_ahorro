import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors.ts';
import spacing from '../../theme/spacing.ts';
import typography from '../../theme/typography.ts';

export default function StatBox({ label, value, style }) {
  return (
    <View style={[styles.box, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: spacing.sm,
    minHeight: 72,
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
});
