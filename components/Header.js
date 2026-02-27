import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DarkButton from "./DarkButton";
import palette from "../theme/colors";

export default function Header({
  userName,
  levelLabel,
  pointsLabel,
  profilePhoto,
  isDarkMode,
  onToggleTheme,
  onTogglePlan,
  activePlan,
  showActionButtons,
  onOpenProfile,
}) {
  const userInitial = userName?.trim()?.charAt(0)?.toUpperCase() || "U";
  const debtButtonLabel =
    activePlan === "deudas" ? "Plan de ahorro" : "Plan deudas";

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.header,
          isDarkMode ? styles.headerDark : styles.headerLight,
        ]}
      >
        <View style={styles.marbleOrbLarge} />
        <View style={styles.marbleOrbSmall} />

        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.userBlock}
            onPress={onOpenProfile}
            activeOpacity={0.8}
          >
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarFallbackText}>{userInitial}</Text>
              </View>
            )}

            <View>
              <Text
                style={[
                  styles.greeting,
                  isDarkMode ? styles.greetingDark : styles.greetingLight,
                ]}
              >
                Hola, {userName} 👋
              </Text>
              <Text
                style={[
                  styles.level,
                  isDarkMode ? styles.levelDark : styles.levelLight,
                ]}
              >
                {levelLabel}
              </Text>
            </View>
          </TouchableOpacity>

          <View
            style={[
              styles.pointsPill,
              isDarkMode ? styles.pointsPillDark : styles.pointsPillLight,
            ]}
          >
            <Text
              style={[
                styles.pointsPillLabel,
                isDarkMode
                  ? styles.pointsPillLabelDark
                  : styles.pointsPillLabelLight,
              ]}
            >
              Puntos
            </Text>
            <Text
              style={[
                styles.pointsPillValue,
                isDarkMode
                  ? styles.pointsPillValueDark
                  : styles.pointsPillValueLight,
              ]}
            >
              {pointsLabel}
            </Text>
          </View>
        </View>
      </View>

      {showActionButtons && (
        <View style={styles.actionsRow}>
          <DarkButton
            onPress={onToggleTheme}
            label={isDarkMode ? "Modo claro" : "Modo oscuro"}
            style={styles.themeButtonWrapper}
            gradientStyle={styles.themeButton}
            textStyle={styles.themeButtonText}
          />

          {onTogglePlan && (
            <DarkButton
              onPress={onTogglePlan}
              label={debtButtonLabel}
              style={styles.themeButtonWrapper}
              gradientStyle={styles.themeButton}
              textStyle={styles.themeButtonText}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20, gap: 10 },
  header: {
    borderRadius: 12,
    padding: 14,
    overflow: "hidden",
    position: "relative",
  },
  headerDark: {
    backgroundColor: palette.black,
    borderWidth: 1,
    borderColor: palette.midnightSlate,
  },
  headerLight: {
    backgroundColor: palette.silverMist,
    borderWidth: 1,
    borderColor: palette.midnightSlate,
  },
  marbleOrbLarge: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -95,
    right: -35,
  },
  marbleOrbSmall: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -55,
    left: -20,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  userBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.midnightSlate,
  },
  avatarFallbackText: {
    color: palette.white,
    fontWeight: "800",
    fontSize: 18,
  },
  greeting: { fontSize: 20, fontWeight: "700" },
  greetingDark: { color: palette.white },
  greetingLight: { color: palette.black },
  level: { marginTop: 2, fontSize: 13, fontWeight: "600" },
  levelDark: { color: palette.silverMist },
  levelLight: { color: palette.midnightSlate },
  pointsPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 82,
  },
  pointsPillDark: {
    backgroundColor: palette.midnightSlate,
    borderWidth: 1,
    borderColor: palette.silverMist,
  },
  pointsPillLight: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.midnightSlate,
  },
  pointsPillLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  pointsPillLabelDark: { color: palette.silverMist },
  pointsPillLabelLight: { color: palette.midnightSlate },
  pointsPillValue: { marginTop: 2, fontSize: 14, fontWeight: "800" },
  pointsPillValueDark: { color: palette.thunderLime },
  pointsPillValueLight: { color: palette.black },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  themeButtonWrapper: { flex: 1, minWidth: 160 },
  themeButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
  },
  themeButtonText: { fontWeight: "700", fontSize: 13 },
});
