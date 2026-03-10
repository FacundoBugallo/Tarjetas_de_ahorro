import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import questionBank from "../data/gameQuestions";

const LEVEL_GROUPS = [
  { key: "principiante", label: "Principiante", accent: "#22C55E" },
  { key: "intermedio", label: "Intermedio", accent: "#3B82F6" },
  { key: "amateur", label: "Amateur", accent: "#A855F7" },
];

const LEVELS_PER_GROUP = 50;
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

export default function GameSection() {
  const [activeGroup, setActiveGroup] = useState(LEVEL_GROUPS[0].key);
  const [completedLevelsByGroup, setCompletedLevelsByGroup] = useState({
    principiante: 0,
    intermedio: 0,
    amateur: 0,
  });
  const [lostLivesAt, setLostLivesAt] = useState([]);
  const [quizState, setQuizState] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLostLivesAt((prev) => prev.filter((lostAt) => Date.now() - lostAt < LIFE_RECOVERY_MS));
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const availableLives = MAX_LIVES - lostLivesAt.length;
  const unlockedLevel = Math.min(
    completedLevelsByGroup[activeGroup] + 1,
    LEVELS_PER_GROUP,
  );

  const groupQuestions = useMemo(
    () => questionBank[activeGroup] || [],
    [activeGroup],
  );

  const visibleLevels = useMemo(() => {
    const start = Math.max(1, unlockedLevel - 4);
    const end = Math.min(LEVELS_PER_GROUP, start + 9);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index).reverse();
  }, [unlockedLevel]);

  const handleStartLevel = (levelNumber) => {
    if (quizState || levelNumber !== unlockedLevel || availableLives <= 0) {
      return;
    }

    const selectedQuestions = shuffle(groupQuestions).slice(0, QUESTIONS_TO_PASS);
    setQuizState({
      levelNumber,
      currentQuestionIndex: 0,
      questions: selectedQuestions,
      selectedOption: null,
      status: "playing",
      correctAnswers: 0,
      message: "",
    });
  };

  const handleAnswer = (optionIndex) => {
    if (!quizState || quizState.status !== "playing") {
      return;
    }

    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = currentQuestion.answerIndex === optionIndex;

    if (!isCorrect) {
      setLostLivesAt((prev) => [...prev, Date.now()].slice(-MAX_LIVES));
      setQuizState((prev) => ({
        ...prev,
        selectedOption: optionIndex,
        status: "failed",
        message: "Respuesta incorrecta. Perdiste una vida, intenta de nuevo.",
      }));
      return;
    }

    const nextIndex = quizState.currentQuestionIndex + 1;
    const nextCorrectAnswers = quizState.correctAnswers + 1;

    if (nextCorrectAnswers >= QUESTIONS_TO_PASS) {
      setCompletedLevelsByGroup((prev) => ({
        ...prev,
        [activeGroup]: Math.max(prev[activeGroup], quizState.levelNumber),
      }));
      setQuizState((prev) => ({
        ...prev,
        selectedOption: optionIndex,
        status: "passed",
        message: "¡Nivel superado! Se desbloqueó el siguiente.",
      }));
      return;
    }

    setQuizState((prev) => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      correctAnswers: nextCorrectAnswers,
      selectedOption: null,
    }));
  };

  const currentQuestion = quizState?.questions[quizState.currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Juego financiero</Text>
      <Text style={styles.subtitle}>
        3 mundos principales, 50 niveles cada uno. Responde 5 preguntas para avanzar.
      </Text>

      <View style={styles.groupTabs}>
        {LEVEL_GROUPS.map((group) => {
          const active = group.key === activeGroup;
          return (
            <Pressable
              key={group.key}
              onPress={() => {
                setActiveGroup(group.key);
                setQuizState(null);
              }}
              style={[
                styles.groupTab,
                active && { borderColor: group.accent, backgroundColor: `${group.accent}33` },
              ]}
            >
              <Text style={[styles.groupTabText, active && { color: "#FFFFFF" }]}>{group.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.livesRow}>
        <Text style={styles.livesText}>{"❤️".repeat(availableLives) || "💔"}</Text>
        <Text style={styles.recoveryText}>{getRecoveryLabel(lostLivesAt)}</Text>
      </View>

      {quizState ? (
        <View style={styles.quizCard}>
          <Text style={styles.quizBadge}>Nivel {quizState.levelNumber}</Text>
          <Text style={styles.quizProgress}>
            Pregunta {quizState.currentQuestionIndex + 1}/{QUESTIONS_TO_PASS}
          </Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
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
              <Pressable style={styles.retryButton} onPress={() => setQuizState(null)}>
                <Text style={styles.retryButtonText}>Volver al mapa</Text>
              </Pressable>
            </>
          )}
        </View>
      ) : (
        <View style={styles.mapContainer}>
          {visibleLevels.map((levelNumber, index) => {
            const isUnlocked = levelNumber <= unlockedLevel;
            const isCurrent = levelNumber === unlockedLevel;
            const isCompleted = levelNumber <= completedLevelsByGroup[activeGroup];
            const currentGroup = LEVEL_GROUPS.find((group) => group.key === activeGroup);
            const alignRight = index % 2 === 0;

            return (
              <Pressable
                key={`${activeGroup}-${levelNumber}`}
                onPress={() => handleStartLevel(levelNumber)}
                disabled={!isCurrent || availableLives <= 0}
                style={[
                  styles.levelCard,
                  alignRight ? styles.alignRight : styles.alignLeft,
                  !isUnlocked && styles.levelLocked,
                  isCurrent && { borderColor: currentGroup.accent, backgroundColor: `${currentGroup.accent}22` },
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
  groupTabs: { flexDirection: "row", gap: 8 },
  groupTab: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.45)",
  },
  groupTabText: { color: "#CBD5E1", fontWeight: "700", fontSize: 13 },
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
});
