import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/formatters';

const AD_NETWORK_GUIDE_URL = 'https://developers.google.com/admob/react-native/quick-start';

export default function AdYieldCard({ currencyCode, projectedYield }) {
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
          <Text style={styles.badgeText}>Anuncios discretos</Text>
        </View>
        <Text style={styles.yieldText}>{formatCurrency(projectedYield, currencyCode)}/mes</Text>
      </View>

      <Text style={styles.title}>Rendimientos extra sin romper la experiencia</Text>
      <Text style={styles.description}>
        Usa banners pequeños en zonas de pausa (por ejemplo, debajo del historial o al cerrar una meta)
        para sumar ingresos de forma no intrusiva.
      </Text>

      <View style={styles.stepsBlock}>
        <Text style={styles.stepsTitle}>Cómo conectarlo</Text>
        <Text style={styles.step}>1) Crea tu app en AdMob y registra un bloque de banner.</Text>
        <Text style={styles.step}>2) Instala el SDK de anuncios en React Native.</Text>
        <Text style={styles.step}>3) Muestra el banner sólo en vistas secundarias para mantener foco.</Text>
      </View>

      <Pressable onPress={openGuide} style={styles.linkButton}>
        <Text style={styles.linkButtonText}>Ver guía de integración</Text>
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
