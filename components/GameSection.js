import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import questionBank from "../data/gameQuestions";

const LEVEL_GROUPS = [
  { key: "principiante", label: "Principiante", accent: "#22C55E", pointsPerQuestion: 5 },
  { key: "intermedio", label: "Intermedio", accent: "#3B82F6", pointsPerQuestion: 10 },
  { key: "amateur", label: "Amateur", accent: "#A855F7", pointsPerQuestion: 15 },
];

const QUESTIONS_TO_PASS = 5;
const MAX_LIVES = 3;
const LIFE_RECOVERY_MS = 24 * 60 * 60 * 1000;

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const getRecoveryLabel = (lostLives) => {
  if (!lostLives.length) {
    return "Vidas completas";
  }

  const oldestLoss = lostLives[0];
  const nextRecoveryInMs = LIFE_RECOVERY_MS - (Date.now() - oldestLoss);
  const safeMs = Math.max(nextRecoveryInMs, 0);
  const hours = Math.floor(safeMs / (60 * 60 * 1000));
  const minutes = Math.floor((safeMs % (60 * 60 * 1000)) / (60 * 1000));
  return `Próxima vida en ${hours}h ${minutes}m`;
};

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
  lostLivesAt: [],
  quizState: null,
  celebration: null,
});

export default function GameSection({ gameProgress, onGameProgressChange, onEarnPoints }) {
  const progress = gameProgress || getEmptyProgress();
  const {
    selectedGroup,
    completedLevelsByGroup,
    usedQuestionIdsByGroup,
    lostLivesAt,
    quizState,
    celebration,
  } = progress;

  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!celebration) {
      pulseAnim.setValue(0);
      return;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 650, useNativeDriver: true }),
      ]),
    ).start();
  }, [celebration, pulseAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      onGameProgressChange((prev) => ({
        ...prev,
        lostLivesAt: prev.lostLivesAt.filter((lostAt) => Date.now() - lostAt < LIFE_RECOVERY_MS),
      }));
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [onGameProgressChange]);

  const availableLives = MAX_LIVES - lostLivesAt.length;

  const levelCaps = useMemo(
    () =>
      LEVEL_GROUPS.reduce((acc, group) => {
        const groupQuestions = questionBank[group.key] || [];
        acc[group.key] = Math.max(1, Math.floor(groupQuestions.length / QUESTIONS_TO_PASS));
        return acc;
      }, {}),
    [],
  );

  const activeGroupMeta = LEVEL_GROUPS.find((group) => group.key === selectedGroup) || LEVEL_GROUPS[0];
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

  const canUnlockIntermedio = completedLevelsByGroup.principiante >= levelCaps.principiante;
  const canUnlockAmateur =
    canUnlockIntermedio && completedLevelsByGroup.intermedio >= levelCaps.intermedio;

  const handleSelectGroup = (groupKey) => {
    const isIntermedioBlocked = groupKey === "intermedio" && !canUnlockIntermedio;
    const isAmateurBlocked = groupKey === "amateur" && !canUnlockAmateur;
    if (isIntermedioBlocked || isAmateurBlocked) {
      return;
    }

    onGameProgressChange((prev) => ({ ...prev, selectedGroup: groupKey, quizState: null, celebration: null }));
  };

  const handleStartLevel = (levelNumber) => {
    if (!selectedGroup || quizState || levelNumber !== unlockedLevel || availableLives <= 0) {
      return;
    }

    const groupQuestions = questionBank[selectedGroup] || [];
    const usedIds = new Set(usedQuestionIdsByGroup[selectedGroup] || []);
    const availableQuestions = groupQuestions.filter((question) => !usedIds.has(question.id));

    if (availableQuestions.length < QUESTIONS_TO_PASS) {
      onGameProgressChange((prev) => ({
        ...prev,
        quizState: {
          levelNumber,
          currentQuestionIndex: 0,
          questions: [],
          selectedOption: null,
          status: "failed",
          correctAnswers: 0,
          message: "Sin preguntas nuevas suficientes para este nivel. Agrega más para seguir avanzando sin repetir.",
        },
      }));
      return;
    }

    const selectedQuestions = shuffle(availableQuestions).slice(0, QUESTIONS_TO_PASS);
    onGameProgressChange((prev) => ({
      ...prev,
      quizState: {
        levelNumber,
        currentQuestionIndex: 0,
        questions: selectedQuestions,
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

    if (!isCorrect) {
      onGameProgressChange((prev) => ({
        ...prev,
        lostLivesAt: [...prev.lostLivesAt, Date.now()].slice(-MAX_LIVES),
        quizState: {
          ...prev.quizState,
          selectedOption: optionIndex,
          status: "failed",
          message: "Respuesta incorrecta. Perdiste una vida, intenta de nuevo.",
        },
      }));
      return;
    }

    const nextIndex = quizState.currentQuestionIndex + 1;
    const nextCorrectAnswers = quizState.correctAnswers + 1;

    if (nextCorrectAnswers >= QUESTIONS_TO_PASS) {
      const earnedPoints = QUESTIONS_TO_PASS * activeGroupMeta.pointsPerQuestion;
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
        },
      }));
      return;
    }

    onGameProgressChange((prev) => ({
      ...prev,
      quizState: {
        ...prev.quizState,
        currentQuestionIndex: nextIndex,
        correctAnswers: nextCorrectAnswers,
        selectedOption: null,
      },
    }));
  };

  const currentQuestion = quizState?.questions[quizState.currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Juego financiero</Text>
      <Text style={styles.subtitle}>Elige un bloque y avanza sin repetir preguntas ya superadas.</Text>

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
                    : `${levelCaps[group.key]} niveles · ${group.pointsPerQuestion} pts por pregunta`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : celebration ? (
        <Animated.View
          style={[
            styles.celebrationCard,
            { transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }] },
          ]}
        >
          <Text style={styles.celebrationTitle}>🎉 ¡Nivel completado!</Text>
          <Text style={styles.celebrationText}>Nivel {celebration.levelNumber} superado en {activeGroupMeta.label}.</Text>
          <Text style={styles.celebrationPoints}>+{celebration.earnedPoints} puntos</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => onGameProgressChange((prev) => ({ ...prev, celebration: null, quizState: null }))}
          >
            <Text style={styles.retryButtonText}>Volver al mapa</Text>
          </Pressable>
        </Animated.View>
      ) : quizState ? (
        <View style={styles.quizCard}>
          <Text style={styles.quizBadge}>{activeGroupMeta.label} · Nivel {quizState.levelNumber}</Text>
          <Text style={styles.quizProgress}>Pregunta {quizState.currentQuestionIndex + 1}/{QUESTIONS_TO_PASS}</Text>
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
        </View>
      ) : (
        <>
          <View style={styles.groupHeaderRow}>
            <Pressable style={styles.backButton} onPress={() => onGameProgressChange((prev) => ({ ...prev, selectedGroup: null }))}>
              <Text style={styles.backButtonText}>← Bloques</Text>
            </Pressable>
            <Text style={styles.groupBadge}>{activeGroupMeta.label}</Text>
          </View>

          <View style={styles.livesRow}>
            <Text style={styles.livesText}>{"❤️".repeat(availableLives) || "💔"}</Text>
            <Text style={styles.recoveryText}>{getRecoveryLabel(lostLivesAt)}</Text>
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
                  disabled={!isCurrent || availableLives <= 0}
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
                  <View>
                    <Text style={styles.levelNumber}>Nivel {levelNumber}</Text>
                    <Text style={styles.levelMeta}>
                      {isCompleted ? "✅ Completado" : isCurrent ? "Siguiente nivel" : "Bloqueado"}
                    </Text>
                  </View>
                  <Text style={styles.levelGoal}>5 preguntas</Text>
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
  groupHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "rgba(30,41,59,0.8)" },
  backButtonText: { color: "#E2E8F0", fontWeight: "700" },
  groupBadge: { color: "#A7F3D0", fontWeight: "700" },
  livesRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  livesText: { color: "#FCA5A5", fontSize: 18, letterSpacing: 1 },
  recoveryText: { color: "#94A3B8", fontSize: 12 },
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
    maxWidth: "90%",
  },
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
  celebrationCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(76,29,149,0.7)",
    gap: 10,
    alignItems: "center",
  },
  celebrationTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "900" },
  celebrationText: { color: "#E9D5FF", fontWeight: "600" },
  celebrationPoints: { color: "#FDE68A", fontWeight: "900", fontSize: 30 },
});
