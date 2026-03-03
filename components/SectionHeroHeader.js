import { StyleSheet, Text, View } from "react-native";

export default function SectionHeroHeader({
  title,
  description,
  accentColor,
  backgroundColor,
  borderColor,
  titleColor,
  descriptionColor,
}) {
  return (
    <View
      style={[
        styles.container,
        {
          // Fondo personalizable por sección (ahorro/deudas/gráficos/perfil).
          backgroundColor,
          // Borde personalizable por sección para dar identidad visual.
          borderColor,
        },
      ]}
    >
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
