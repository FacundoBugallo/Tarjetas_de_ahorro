import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors.ts';
import spacing from '../../theme/spacing.ts';
import typography from '../../theme/typography.ts';
import Button from './Button';

export default function EmptyState({
  title,
  description,
  ctaLabel,
  onCtaPress,
  icon = 'folder-open-outline',
}) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={26} color={colors.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      {!!description && <Text style={styles.description}>{description}</Text>}
      {!!ctaLabel && !!onCtaPress && (
        <Button label={ctaLabel} onPress={onCtaPress} variant="secondary" style={styles.cta} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cta: { marginTop: spacing.sm, minWidth: 180 },
});
