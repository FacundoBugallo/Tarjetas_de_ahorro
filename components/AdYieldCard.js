import { Linking, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/formatters';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import colors from '../theme/colors.ts';
import spacing from '../theme/spacing.ts';
import typography from '../theme/typography.ts';

const AD_NETWORK_GUIDE_URL = 'https://developers.google.com/admob/react-native/quick-start';

const DEFAULT_STEPS = [
  '1) Crea tu app en AdMob y registra un bloque de banner.',
  '2) Instala el SDK de anuncios en React Native.',
  '3) Muestra el banner sólo en vistas secundarias para mantener foco.',
];

export default function AdYieldCard({
  currencyCode,
  projectedYield,
  placement = 'Anuncios discretos',
  title = 'Rendimientos extra sin romper la experiencia',
  description =
    'Usa banners pequeños en zonas de pausa (por ejemplo, debajo del historial o al cerrar una meta) para sumar ingresos de forma no intrusiva.',
  staticUnitId = 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  steps = DEFAULT_STEPS,
  ctaLabel = 'Ver guía de integración',
  showStaticHint = true,
}) {
  const openGuide = async () => {
    try {
      await Linking.openURL(AD_NETWORK_GUIDE_URL);
    } catch {
      // noop
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Badge label={placement} color={colors.secondary} />
        <Text style={styles.yieldText}>{formatCurrency(projectedYield, currencyCode)}/mes</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {showStaticHint && (
        <View style={styles.staticHint}>
          <Text style={styles.staticHintTitle}>ID estático sugerido</Text>
          <Text style={styles.staticHintCode}>{staticUnitId}</Text>
        </View>
      )}

      <View style={styles.stepsBlock}>
        <Text style={styles.stepsTitle}>Cómo conectarlo</Text>
        {steps.map((step) => (
          <Text key={step} style={styles.step}>
            {step}
          </Text>
        ))}
      </View>

      <Button label={ctaLabel} onPress={openGuide} variant="secondary" accessibilityLabel={ctaLabel} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.sm, gap: spacing.xs },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.xs },
  yieldText: { ...typography.caption, color: colors.textPrimary, fontWeight: '700' },
  title: { ...typography.subtitle, color: colors.textPrimary },
  description: { ...typography.body, color: colors.textSecondary },
  staticHint: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(6, 78, 59, 0.18)',
    padding: spacing.xs,
    gap: 2,
  },
  staticHintTitle: { ...typography.caption, color: colors.textSecondary },
  staticHintCode: { ...typography.caption, color: colors.secondary, fontWeight: '700' },
  stepsBlock: { gap: spacing.xxs },
  stepsTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '700' },
  step: { ...typography.caption, color: colors.textSecondary },
});
