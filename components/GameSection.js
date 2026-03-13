import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import questionBank from "../data/gameQuestions";

const LEVEL_GROUPS = [
  {
    key: "principiante",
    label: "Principiante",
    accent: "#22C55E",
    pointsPerLevel: 10,
  },
  {
    key: "intermedio",
    label: "Intermedio",
    accent: "#3B82F6",
    pointsPerLevel: 15,
  },
  { key: "amateur", label: "Amateur", accent: "#A855F7", pointsPerLevel: 20 },
];

const TOTAL_LEVELS_PER_BLOCK = 15;
const MAX_DAILY_ENERGY = 3;
const QUESTIONS_PER_LEVEL = 5;
const MAX_LEVEL_LIVES = 3;

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const getDateKey = () => new Date().toISOString().slice(0, 10);

const getEmptyProgress = () => ({
  selectedGroup: null,
  completedLevelsByGroup: {
    principiante: 0,
    intermedio: 0,
    amateur: 0,
  },
  usedQuestionIdsByGroup: {
    principiante: [],
    intermedio: [],
    amateur: [],
  },
  dailyEnergy: {
    date: getDateKey(),
    spent: 0,
  },
  quizState: null,
  celebration: null,
});

export default function GameSection({
  gameProgress,
  onGameProgressChange,
  onEarnPoints,
}) {
  const progress = gameProgress || getEmptyProgress();
  const {
    selectedGroup,
    completedLevelsByGroup,
    usedQuestionIdsByGroup,
    dailyEnergy,
    quizState,
    celebration,
  } = progress;

  const normalizedEnergy = {
    date: dailyEnergy?.date || getDateKey(),
    spent: Number.isFinite(dailyEnergy?.spent) ? dailyEnergy.spent : 0,
  };
  const isCurrentDay = normalizedEnergy.date === getDateKey();
  const spentEnergyToday = isCurrentDay ? normalizedEnergy.spent : 0;
  const availableEnergy = Math.max(MAX_DAILY_ENERGY - spentEnergyToday, 0);

  const walkerAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const [animatedPoints, setAnimatedPoints] = useState(0);

  useEffect(() => {
    if (!selectedGroup || quizState || celebration) {
      walkerAnim.stopAnimation();
      return;
    }

    walkerAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(walkerAnim, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(walkerAnim, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [selectedGroup, quizState, celebration, walkerAnim]);

  useEffect(() => {
    if (!celebration?.earnedPoints) {
      confettiAnim.stopAnimation();
      confettiAnim.setValue(0);
      setAnimatedPoints(0);
      return;
    }

    Animated.loop(
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 1700,
        useNativeDriver: true,
      }),
    ).start();

    setAnimatedPoints(0);
    let counter = 0;
    const interval = setInterval(() => {
      counter += 1;
      setAnimatedPoints(counter);
      if (counter >= celebration.earnedPoints) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [celebration, confettiAnim]);

  useEffect(() => {
    if (isCurrentDay || !dailyEnergy) {
      return;
    }

    onGameProgressChange((prev) => ({
      ...prev,
      dailyEnergy: {
        date: getDateKey(),
        spent: 0,
      },
    }));
  }, [dailyEnergy, isCurrentDay, onGameProgressChange]);

  const levelCaps = useMemo(
    () =>
      LEVEL_GROUPS.reduce((acc, group) => {
        acc[group.key] = TOTAL_LEVELS_PER_BLOCK;
        return acc;
      }, {}),
    [],
  );

  const activeGroupMeta =
    LEVEL_GROUPS.find((group) => group.key === selectedGroup) || LEVEL_GROUPS[0];
  const unlockedLevel = Math.min(
    (completedLevelsByGroup[selectedGroup] || 0) + 1,
    levelCaps[selectedGroup] || 1,
  );

  const visibleLevels = useMemo(() => {
    if (!selectedGroup) return [];

    const start = Math.max(1, unlockedLevel - 4);
    const end = Math.min(levelCaps[selectedGroup], start + 9);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index).reverse();
  }, [selectedGroup, unlockedLevel, levelCaps]);

  const canUnlockIntermedio =
    completedLevelsByGroup.principiante >= levelCaps.principiante;
  const canUnlockAmateur =
    canUnlockIntermedio && completedLevelsByGroup.intermedio >= levelCaps.intermedio;

  const confirmExitToMap = () => {
    Alert.alert(
      "¿Salir del nivel?",
      "Si sales ahora volverás al mapa de niveles.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, salir",
          style: "destructive",
          onPress: () =>
            onGameProgressChange((prev) => ({
              ...prev,
              quizState: null,
              celebration: null,
            })),
        },
      ],
    );
  };

  const handleSelectGroup = (groupKey) => {
    const isIntermedioBlocked = groupKey === "intermedio" && !canUnlockIntermedio;
    const isAmateurBlocked = groupKey === "amateur" && !canUnlockAmateur;
    if (isIntermedioBlocked || isAmateurBlocked) {
      return;
    }

    onGameProgressChange((prev) => ({
      ...prev,
      selectedGroup: groupKey,
      quizState: null,
      celebration: null,
    }));
  };

  const handleStartLevel = (levelNumber) => {
    if (!selectedGroup || quizState || levelNumber !== unlockedLevel || availableEnergy <= 0) {
      return;
    }

    const groupQuestions = questionBank[selectedGroup] || [];
    const usedIds = new Set(usedQuestionIdsByGroup[selectedGroup] || []);
    let availableQuestions = groupQuestions.filter((question) => !usedIds.has(question.id));

    if (!availableQuestions.length) {
      availableQuestions = shuffle(groupQuestions);
    }

    if (!availableQuestions.length) {
      onGameProgressChange((prev) => ({
        ...prev,
        quizState: {
          levelNumber,
          currentQuestionIndex: 0,
          questions: [],
          selectedOption: null,
          status: "failed",
          correctAnswers: 0,
          message: "No hay preguntas disponibles para este bloque.",
        },
      }));
      return;
    }

    const selectedQuestions = shuffle(availableQuestions).slice(0, QUESTIONS_PER_LEVEL);
    onGameProgressChange((prev) => ({
      ...prev,
      dailyEnergy: {
        date: getDateKey(),
        spent: Math.min(
          (prev.dailyEnergy?.date === getDateKey() ? prev.dailyEnergy?.spent || 0 : 0) + 1,
          MAX_DAILY_ENERGY,
        ),
      },
      quizState: {
        levelNumber,
        currentQuestionIndex: 0,
        questions: selectedQuestions,
        remainingLives: MAX_LEVEL_LIVES,
        selectedOption: null,
        status: "playing",
        correctAnswers: 0,
        message: "",
      },
    }));
  };

  const handleAnswer = (optionIndex) => {
    if (!quizState || quizState.status !== "playing") {
      return;
    }

    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = currentQuestion.answerIndex === optionIndex;

    const nextIndex = quizState.currentQuestionIndex + 1;
    const hasMoreQuestions = nextIndex < quizState.questions.length;

    if (!isCorrect) {
      const remainingLives = Math.max((quizState.remainingLives || MAX_LEVEL_LIVES) - 1, 0);
      if (remainingLives <= 0) {
        onGameProgressChange((prev) => ({
          ...prev,
          quizState: {
            ...prev.quizState,
            selectedOption: optionIndex,
            remainingLives,
            status: "failed",
            message:
              "Te quedaste sin vidas en este nivel. Ese bloque ya consumió 1 de energía diaria.",
          },
        }));
        return;
      }

      onGameProgressChange((prev) => ({
        ...prev,
        quizState: {
          ...prev.quizState,
          selectedOption: null,
          remainingLives,
          currentQuestionIndex: hasMoreQuestions ? nextIndex : prev.quizState.currentQuestionIndex,
          status: hasMoreQuestions ? "playing" : "completed",
          message: hasMoreQuestions
            ? "Respuesta incorrecta. Perdiste 1 vida, seguí con la siguiente pregunta."
            : "Nivel completado.",
        },
      }));

      if (hasMoreQuestions) {
        return;
      }
    }

    if (isCorrect && hasMoreQuestions) {
      onGameProgressChange((prev) => ({
        ...prev,
        quizState: {
          ...prev.quizState,
          selectedOption: null,
          currentQuestionIndex: nextIndex,
          correctAnswers: (prev.quizState.correctAnswers || 0) + 1,
          message: "",
        },
      }));
      return;
    }

    const earnedPoints = activeGroupMeta.pointsPerLevel;
    onEarnPoints(earnedPoints);

    onGameProgressChange((prev) => ({
      ...prev,
      completedLevelsByGroup: {
        ...prev.completedLevelsByGroup,
        [selectedGroup]: Math.max(prev.completedLevelsByGroup[selectedGroup], quizState.levelNumber),
      },
      usedQuestionIdsByGroup: {
        ...prev.usedQuestionIdsByGroup,
        [selectedGroup]: [
          ...new Set([
            ...prev.usedQuestionIdsByGroup[selectedGroup],
            ...quizState.questions.map((question) => question.id),
          ]),
        ],
      },
      quizState: null,
      celebration: {
        group: selectedGroup,
        levelNumber: quizState.levelNumber,
        earnedPoints,
        remainingLives: isCorrect
          ? quizState.remainingLives
          : Math.max((quizState.remainingLives || MAX_LEVEL_LIVES) - 1, 0),
      },
    }));
  };

  const currentQuestion = quizState?.questions[quizState.currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Juego financiero</Text>
      <Text style={styles.subtitle}>
        Cada bloque tiene 15 niveles, cada nivel tiene 5 preguntas y cada intento consume 1 de energía diaria.
      </Text>

      {!selectedGroup ? (
        <View style={styles.blockSelector}>
          {LEVEL_GROUPS.map((group) => {
            const isBlocked =
              (group.key === "intermedio" && !canUnlockIntermedio) ||
              (group.key === "amateur" && !canUnlockAmateur);

            return (
              <Pressable
                key={group.key}
                onPress={() => handleSelectGroup(group.key)}
                disabled={isBlocked}
                style={[styles.bigBlock, { borderColor: group.accent }, isBlocked && styles.levelLocked]}
              >
                <Text style={styles.bigBlockTitle}>{group.label}</Text>
                <Text style={styles.bigBlockMeta}>
                  {isBlocked
                    ? "Bloqueado hasta completar bloques anteriores"
                    : `${TOTAL_LEVELS_PER_BLOCK} niveles · ${group.pointsPerLevel} pts por nivel`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : celebration ? (
        <View style={styles.celebrationCard}>
          <View style={styles.confettiContainer}>
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <Animated.Text
                key={`confetti-${item}`}
                style={[
                  styles.confettiPiece,
                  {
                    left: `${8 + item * 15}%`,
                    transform: [
                      {
                        translateY: confettiAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-26 - item * 2, 34 + item * 4],
                        }),
                      },
                      {
                        rotate: confettiAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", `${item % 2 === 0 ? 260 : -260}deg`],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {item % 2 === 0 ? "🎉" : "✨"}
              </Animated.Text>
            ))}
          </View>

          <Text style={styles.celebrationTitle}>¡Nivel completado!</Text>

          <View style={styles.celebrationStatsRow}>
            <View style={styles.celebrationStatBox}>
              <MaterialCommunityIcons name="star-circle" size={22} color="#FDE047" />
              <Text style={styles.celebrationStatText}>{animatedPoints} pts</Text>
            </View>
            <View style={styles.celebrationStatBox}>
              <MaterialCommunityIcons name="heart" size={22} color="#FB7185" />
              <Text style={styles.celebrationStatText}>
                {celebration.remainingLives ?? MAX_LEVEL_LIVES}
              </Text>
            </View>
            <View style={styles.celebrationStatBox}>
              <MaterialCommunityIcons name="flag-checkered" size={22} color="#93C5FD" />
              <Text style={styles.celebrationStatText}>Nv {celebration.levelNumber}</Text>
            </View>
          </View>

          <Pressable
            style={styles.retryButton}
            onPress={() =>
              onGameProgressChange((prev) => ({
                ...prev,
                celebration: null,
                quizState: null,
              }))
            }
          >
            <Text style={styles.retryButtonText}>Volver al mapa</Text>
          </Pressable>

          <Pressable style={styles.backBottomButton} onPress={confirmExitToMap}>
            <Text style={styles.backBottomButtonText}>Atrás</Text>
          </Pressable>
        </View>
      ) : quizState ? (
        <View style={styles.quizCard}>
          <Text style={styles.quizBadge}>
            {activeGroupMeta.label} · Nivel {quizState.levelNumber}
          </Text>
          <Text style={styles.quizProgress}>
            Pregunta {quizState.currentQuestionIndex + 1}/
            {quizState.questions.length || QUESTIONS_PER_LEVEL}
          </Text>
          <View style={styles.quizLivesRow}>
            <MaterialCommunityIcons name="heart" size={17} color="#FB7185" />
            <Text style={styles.quizProgress}>
              {quizState.remainingLives ?? MAX_LEVEL_LIVES}/{MAX_LEVEL_LIVES}
            </Text>
          </View>
          <Text style={styles.questionText}>{currentQuestion?.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion?.options?.map((option, index) => (
              <Pressable
                key={`${currentQuestion.id}-${option}`}
                onPress={() => handleAnswer(index)}
                disabled={quizState.status !== "playing"}
                style={styles.optionButton}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))}
          </View>

          {quizState.status !== "playing" && (
            <>
              <Text style={styles.feedbackText}>{quizState.message}</Text>
              <Pressable
                style={styles.retryButton}
                onPress={() => onGameProgressChange((prev) => ({ ...prev, quizState: null }))}
              >
                <Text style={styles.retryButtonText}>Volver al mapa</Text>
              </Pressable>
            </>
          )}

          <Pressable style={styles.backBottomButton} onPress={confirmExitToMap}>
            <Text style={styles.backBottomButtonText}>Atrás</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.groupHeaderRow}>
            <Pressable
              style={styles.backButton}
              onPress={() => onGameProgressChange((prev) => ({ ...prev, selectedGroup: null }))}
            >
              <Text style={styles.backButtonText}>← Bloques</Text>
            </Pressable>
            <Text style={styles.groupBadge}>{activeGroupMeta.label}</Text>
          </View>

          <View style={styles.livesRow}>
            <Text style={styles.livesText}>⚡ {availableEnergy}/{MAX_DAILY_ENERGY}</Text>
            <Text style={styles.recoveryText}>Máximo 3 bloques por día</Text>
          </View>

          <View style={styles.healthRow}>
            <MaterialCommunityIcons name="heart" size={16} color="#FB7185" />
            <Text style={styles.healthText}> {MAX_LEVEL_LIVES}/{MAX_LEVEL_LIVES}</Text>
          </View>

          <View style={styles.mapContainer}>
            {visibleLevels.map((levelNumber, index) => {
              const isCurrent = levelNumber === unlockedLevel;
              const isCompleted = levelNumber <= completedLevelsByGroup[selectedGroup];
              const alignRight = index % 2 === 0;

              return (
                <Pressable
                  key={`${selectedGroup}-${levelNumber}`}
                  onPress={() => handleStartLevel(levelNumber)}
                  disabled={!isCurrent || availableEnergy <= 0}
                  style={[
                    styles.levelCard,
                    alignRight ? styles.alignRight : styles.alignLeft,
                    isCurrent && {
                      borderColor: activeGroupMeta.accent,
                      backgroundColor: `${activeGroupMeta.accent}22`,
                    },
                    !isCurrent && !isCompleted && styles.levelLocked,
                  ]}
                >
                  <View style={styles.levelMainRow}>
                    <Animated.View
                      style={
                        isCurrent
                          ? {
                              transform: [
                                {
                                  translateY: walkerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -6],
                                  }),
                                },
                              ],
                            }
                          : null
                      }
                    >
                      <MaterialCommunityIcons
                        name={
                          isCompleted
                            ? "check-circle"
                            : isCurrent
                              ? "walk"
                              : "lock-outline"
                        }
                        size={26}
                        color={
                          isCompleted
                            ? "#4ADE80"
                            : isCurrent
                              ? activeGroupMeta.accent
                              : "#64748B"
                        }
                      />
                    </Animated.View>
                    <View style={styles.levelTextCol}>
                      <Text style={styles.levelNumber}>Nivel {levelNumber}</Text>
                      <Text style={styles.levelMeta}>
                        {isCompleted ? "Completado" : isCurrent ? "Siguiente nivel" : "Bloqueado"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.levelRightCol}>
                    <Text style={styles.levelGoal}>5 preguntas</Text>
                    <MaterialCommunityIcons
                      name="shoe-print"
                      size={16}
                      color={isCurrent ? activeGroupMeta.accent : "#64748B"}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    padding: 16,
    gap: 12,
  },
  title: { color: "#F8FAFC", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#BFDBFE", fontSize: 13, lineHeight: 18 },
  blockSelector: { gap: 12, marginTop: 8 },
  bigBlock: {
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: "rgba(30,41,59,0.8)",
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  bigBlockTitle: { color: "#F8FAFC", fontSize: 24, fontWeight: "900" },
  bigBlockMeta: { color: "#BFDBFE", marginTop: 6, fontWeight: "600" },
  groupHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(30,41,59,0.8)",
  },
  backButtonText: { color: "#E2E8F0", fontWeight: "700" },
  groupBadge: { color: "#A7F3D0", fontWeight: "700" },
  livesRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  livesText: { color: "#FCA5A5", fontSize: 18, letterSpacing: 1, fontWeight: "700" },
  recoveryText: { color: "#94A3B8", fontSize: 12 },
  healthRow: { flexDirection: "row", alignItems: "center", marginTop: -8 },
  healthText: { color: "#FECACA", fontSize: 14, fontWeight: "700" },
  mapContainer: { gap: 10, marginTop: 8 },
  levelCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(30,41,59,0.85)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "92%",
  },
  levelMainRow: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 },
  levelTextCol: { flexShrink: 1 },
  levelRightCol: { alignItems: "flex-end", gap: 4 },
  alignRight: { alignSelf: "flex-end" },
  alignLeft: { alignSelf: "flex-start" },
  levelLocked: { opacity: 0.45 },
  levelNumber: { color: "#E2E8F0", fontWeight: "800", fontSize: 20 },
  levelMeta: { color: "#93C5FD", marginTop: 2, fontSize: 12, fontWeight: "600" },
  levelGoal: { color: "#FDE68A", fontWeight: "700", fontSize: 12 },
  quizCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    gap: 10,
  },
  quizBadge: { color: "#A7F3D0", fontSize: 13, fontWeight: "700" },
  quizProgress: { color: "#BFDBFE", fontSize: 12 },
  quizLivesRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  questionText: { color: "#F8FAFC", fontSize: 16, fontWeight: "700", lineHeight: 22 },
  optionsContainer: { gap: 8, marginTop: 4 },
  optionButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    backgroundColor: "rgba(15,23,42,0.65)",
    padding: 12,
  },
  optionText: { color: "#E2E8F0", fontSize: 13, fontWeight: "600" },
  feedbackText: { color: "#FDE68A", fontWeight: "700", marginTop: 8 },
  retryButton: {
    marginTop: 2,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#4F46E5",
  },
  retryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  backBottomButton: {
    marginTop: 2,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(15,23,42,0.45)",
  },
  backBottomButtonText: { color: "#CBD5E1", fontWeight: "700" },
  celebrationCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(76,29,149,0.7)",
    gap: 12,
  },
  confettiContainer: { height: 48, position: "relative" },
  confettiPiece: {
    position: "absolute",
    top: 0,
    fontSize: 20,
  },
  celebrationTitle: {
    color: "#FFFFFF",
    fontSize: 35,
    fontWeight: "900",
    textAlign: "center",
  },
  celebrationStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  celebrationStatBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(15,23,42,0.35)",
    paddingVertical: 10,
  },
  celebrationStatText: { color: "#F8FAFC", fontWeight: "900", fontSize: 17 },
});
