import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatCurrency } from "../utils/formatters";

const AD_NETWORK_GUIDE_URL =
  "https://developers.google.com/admob/react-native/quick-start";

const DEFAULT_STEPS = [
  "1) Crea tu app en AdMob y registra un bloque de banner.",
  "2) Instala el SDK de anuncios en React Native.",
  "3) Muestra el banner sólo en vistas secundarias para mantener foco.",
];

export default function AdYieldCard({
  currencyCode,
  projectedYield,
  placement = "Anuncios discretos",
  title = "Rendimientos extra sin romper la experiencia",
  description = "Usa banners pequeños en zonas de pausa (por ejemplo, debajo del historial o al cerrar una meta) para sumar ingresos de forma no intrusiva.",
  staticUnitId = "ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx",
  steps = DEFAULT_STEPS,
  ctaLabel = "Ver guía de integración",
  showStaticHint = true,
}) {
  const openGuide = async () => {
    try {
      await Linking.openURL(AD_NETWORK_GUIDE_URL);
    } catch {
      // Ignoramos fallos de apertura para no cortar la experiencia.
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <MaterialCommunityIcons name="bullhorn-outline" size={16} color="#A7F3D0" />
          <Text style={styles.badgeText}>{placement}</Text>
        </View>
        <Text style={styles.yieldText}>
          {formatCurrency(projectedYield, currencyCode)}/mes
        </Text>
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

      <Pressable onPress={openGuide} style={styles.linkButton}>
        <Text style={styles.linkButtonText}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(167,243,208,0.30)',
    backgroundColor: 'rgba(7, 21, 18, 0.55)',
    padding: 14,
    gap: 8,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(167,243,208,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: '#D1FAE5', fontWeight: '700', fontSize: 12 },
  yieldText: { color: '#ECFDF5', fontWeight: '800', fontSize: 13 },
  title: { color: '#F0FDF4', fontWeight: '800', fontSize: 14 },
  description: { color: '#CFF7E6', fontSize: 12, lineHeight: 18 },
  staticHint: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(167,243,208,0.30)",
    backgroundColor: "rgba(6, 78, 59, 0.30)",
    padding: 8,
    gap: 2,
  },
  staticHintTitle: { color: "#D1FAE5", fontWeight: "700", fontSize: 11 },
  staticHintCode: { color: "#A7F3D0", fontWeight: "700", fontSize: 11 },
  stepsBlock: { gap: 4 },
  stepsTitle: { color: '#ECFDF5', fontWeight: '700', fontSize: 12 },
  step: { color: '#A7F3D0', fontSize: 12 },
  linkButton: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(236,253,245,0.35)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  linkButtonText: { color: '#ECFDF5', fontWeight: '700', fontSize: 12 },
});
