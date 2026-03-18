import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors.ts';
import spacing from '../../theme/spacing.ts';
import typography from '../../theme/typography.ts';

export default function Badge({ label, color = colors.secondary, style, textStyle }) {
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}20` }, style]}>
      <Text style={[styles.text, { color }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '700',
  },
});
