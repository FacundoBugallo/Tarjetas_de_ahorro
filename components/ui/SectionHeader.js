import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors.ts';
import spacing from '../../theme/spacing.ts';
import typography from '../../theme/typography.ts';
import Button from './Button';

export default function UISectionHeader({ title, subtitle, actionLabel, onActionPress }) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {!!onActionPress && !!actionLabel && (
        <Button label={actionLabel} onPress={onActionPress} variant="primary" style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  left: { flex: 1, gap: spacing.xxs },
  title: { ...typography.subtitle, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  button: { minWidth: 140 },
});
