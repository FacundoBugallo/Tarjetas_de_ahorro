import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
    <View
      style={[
        styles.container,
        {
          // Base oscura translúcida para integrarse al fondo general de la app.
          backgroundColor: "rgba(20,20,26,0.72)",
          // Borde personalizable por sección para dar identidad visual.
          borderColor,
        },
      ]}
    >
      {/* Gradiente base igual al lenguaje visual oscuro de la app. */}
      <LinearGradient
        colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.baseGradient}
        pointerEvents="none"
      />

      {/* Halo de color por sección para personalización sin romper el fondo global. */}
      <View style={[styles.glowOrb, { backgroundColor: glowColor }]} pointerEvents="none" />

      {/* Barra lateral de acento: cambia el color para diferenciar cada sección. */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.content}>
        {/* Título principal de la sección. */}
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>

        {/* Descripción breve para contextualizar lo que puede hacer el usuario aquí. */}
        <Text style={[styles.description, { color: descriptionColor }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    overflow: "hidden",
  },
  baseGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  glowOrb: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 999,
    right: -42,
    top: -95,
    opacity: 0.65,
  },
  accentBar: {
    width: 6,
    borderRadius: 999,
    alignSelf: "stretch",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
});
