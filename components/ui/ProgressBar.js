import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors.ts';
import spacing from '../../theme/spacing.ts';
import typography from '../../theme/typography.ts';

export default function ProgressBar({ progress = 0, color = colors.success, showLabel = true }) {
  const normalized = Math.max(0, Math.min(progress, 100));

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${normalized}%`, backgroundColor: color }]} />
      </View>
      {showLabel ? <Text style={styles.label}>{normalized.toFixed(0)}%</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  track: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  label: {
    ...typography.caption,
    color: colors.textPrimary,
    minWidth: 38,
    textAlign: 'right',
    fontWeight: '700',
  },
});
