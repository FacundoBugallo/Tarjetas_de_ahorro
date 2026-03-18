import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors.ts';
import spacing from '../theme/spacing.ts';
import typography from '../theme/typography.ts';

export default function SectionHeroHeader({
  title,
  description,
  accentColor,
  glowColor,
  borderColor,
  titleColor,
  descriptionColor,
}) {
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: borderColor || colors.border }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.baseGradient}
        pointerEvents="none"
      />
      <View style={[styles.glowOrb, { backgroundColor: glowColor }]} pointerEvents="none" />
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.content}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        <Text style={[styles.description, { color: descriptionColor }]}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  baseGradient: { ...StyleSheet.absoluteFillObject },
  glowOrb: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 999,
    right: -42,
    top: -95,
    opacity: 0.65,
  },
  accentBar: { width: 6, borderRadius: 999, alignSelf: 'stretch' },
  content: { flex: 1, gap: spacing.xxs },
  title: { ...typography.title },
  description: { ...typography.body },
});
