import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CreateCardModal from "./components/CreateCardModal";
import CreateDebtModal from "./components/CreateDebtModal";
import DebtCard from "./components/DebtCard";
import Header from "./components/Header";
import HistoryCard from "./components/HistoryCard";
import SavingsCard from "./components/SavingsCard";
import SectionHeader from "./components/SectionHeader";
import SummaryCard from "./components/SummaryCard";
import UserSummaryModal from "./components/UserSummaryModal";
import dailyTips from "./data/dailyTips";
import savingsCards from "./data/savingsCards";
import { clampPercentage, formatCurrency } from "./utils/formatters";

const tabs = [
  { key: "ahorro", label: "Ahorro", icon: "piggy-bank-outline" },
  { key: "deudas", label: "Deudas", icon: "credit-card-outline" },
  { key: "graficos", label: "Gráficos", icon: "chart-line" },
  { key: "config", label: "Perfil", icon: "account-circle-outline" },
];

const normalizeBackendBaseUrl = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//.test(trimmed)) {
    return trimmed;
  }

  return `http://${trimmed}`;
};

const getBackendBaseUrl = () => {
  const envBaseUrl = normalizeBackendBaseUrl(
    process.env.EXPO_PUBLIC_BACKEND_URL,
  );
  if (envBaseUrl) {
    return envBaseUrl;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  if (Platform.OS === "web") {
    return "http://localhost:8000";
  }

  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) {
      return `http://${host}:8000`;
    }
  }

  return "http://localhost:8000";
};

const BACKEND_BASE_URL = getBackendBaseUrl();
const AI_REQUEST_TIMEOUT_MS = 15000;

const getErrorMessageFromResponse = async (response) => {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string" && data.detail.trim()) {
      return data.detail.trim();
    }
  } catch {
    return "";
  }

  return "";
};

const postJson = async (path, payload) => {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await getErrorMessageFromResponse(response);
    throw new Error(message || "No se pudo completar la solicitud.");
  }

  return response.json();
};

const landingQuestions = [
  {
    key: "meta",
    title: "1. ¿Qué meta querés cumplir primero?",
    options: [
      { key: "emergencia", label: "Fondo de emergencia" },
      { key: "viaje", label: "Viaje o descanso" },
      { key: "deudas", label: "Pagar deudas" },
      { key: "jubilacion", label: "Jubilación y gustos" },
    ],
  },
  {
    key: "ritmo",
    title: "2. ¿Cada cuánto te gustaría ahorrar?",
    options: [
      { key: "diario", label: "Todos los días" },
      { key: "semanal", label: "Cada semana" },
      { key: "mensual", label: "Al mes" },
    ],
  },
  {
    key: "prioridad",
    title: "3. ¿Qué te importa más este mes?",
    options: [
      { key: "constancia", label: "No cortar la racha" },
      { key: "equilibrio", label: "Avanzar sin presionarme" },
      { key: "avance", label: "Crecer lo más rápido posible" },
    ],
  },
  {
    key: "acompanamiento",
    title: "4. ¿Cómo querés el acompañamiento de la app?",
    options: [
      { key: "ligero", label: "Simple y rápido" },
      { key: "retos", label: "Con retos y motivación" },
      { key: "detalle", label: "Con más detalle y datos" },
    ],
  },
  {
    key: "monedaBase",
    title: "5. ¿Qué moneda vas a usar?",
    options: [
      { key: "COP", label: "Pesos (COP)" },
      { key: "USD", label: "Dólares (USD)" },
    ],
  },
];

const toDateKey = (date) => date.toISOString().slice(0, 10);
const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const startOfDay = (value) => {
  const nextDate = new Date(value);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};
const addDays = (value, amount) => {
  const nextDate = new Date(value);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
};
const startOfWeek = (value) => {
  const nextDate = startOfDay(value);
  const day = nextDate.getDay();
  const diff = (day + 6) % 7;
  return addDays(nextDate, -diff);
};
const startOfMonth = (value) => {
  const nextDate = startOfDay(value);
  nextDate.setDate(1);
  return nextDate;
};
const formatShortDate = (value) =>
  value.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
const formatMonthLabel = (value) =>
  value.toLocaleDateString("es-CO", { month: "short", year: "numeric" });
const getPeriodKey = (value, granularity) => {
  if (granularity === "month") {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
  }

  if (granularity === "week") {
    return toDateKey(startOfWeek(value));
  }

  return toDateKey(value);
};
const getPeriodStart = (value, granularity) => {
  if (granularity === "month") {
    return startOfMonth(value);
  }

  if (granularity === "week") {
    return startOfWeek(value);
  }

  return startOfDay(value);
};
const getPeriodLabel = (value, granularity) => {
  if (granularity === "month") {
    return formatMonthLabel(value);
  }

  if (granularity === "week") {
    const start = startOfWeek(value);
    const end = addDays(start, 6);
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
  }

  return value.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
};

export default function App() {
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState(savingsCards);
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [plannedInvestment, setPlannedInvestment] = useState(0);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isCreateCardVisible, setIsCreateCardVisible] = useState(false);
  const [isCreateDebtVisible, setIsCreateDebtVisible] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [bonusAvailable, setBonusAvailable] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("ahorro");
  const [isOnboardingDone, setIsOnboardingDone] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authUserId, setAuthUserId] = useState(null);
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  const [isPlanSetupPending, setIsPlanSetupPending] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    password: "",
    photo: "",
  });
  const [draftPlannedInvestment, setDraftPlannedInvestment] = useState("");
  const [landingAnswers, setLandingAnswers] = useState({
    meta: "emergencia",
    ritmo: "semanal",
    prioridad: "equilibrio",
    acompanamiento: "ligero",
    monedaBase: "COP",
  });
  const [selectedCurrency, setSelectedCurrency] = useState("COP");
  const [transactions, setTransactions] = useState([]);
  const chartGranularity = "month";
  const [bonusWithdrawnMessage, setBonusWithdrawnMessage] = useState("");
  const [onboardingCompletedAt, setOnboardingCompletedAt] = useState("");
  const [snapshotMessage, setSnapshotMessage] = useState("");
  const [debtCards, setDebtCards] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [dailyCheckInAnswers, setDailyCheckInAnswers] = useState({
    spendingControl: "",
    savingsAction: "",
    debtAction: "",
  });
  const [dailyRecommendation, setDailyRecommendation] = useState("");
  const [isDailyRecommendationLoading, setIsDailyRecommendationLoading] =
    useState(false);
  const [lastWeeklyCheckInDate, setLastWeeklyCheckInDate] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      id: "ia-welcome",
      role: "assistant",
      text: "Hola, soy tu asistente GPT. Puedo ayudarte con tus cuentas con calma y tacto. Si quieres un acompañamiento profundo, te invito a conocer el coaching personalizado (archivos, documentación y seguimiento 1:1), como una charla de café ☕.",
    },
  ]);

  const pointsPerBlock = 50;
  const currencyBlockValue = selectedCurrency === "USD" ? 100 : 100000;
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const monthlyTransactions = useMemo(
    () => transactions.filter((tx) => tx.date.startsWith(currentMonthKey)),
    [transactions, currentMonthKey],
  );

  const totalInvestedThisMonth = useMemo(() => {
    const monthlyNet = monthlyTransactions.reduce(
      (acc, tx) => acc + tx.delta,
      0,
    );
    return Math.max(monthlyNet, 0);
  }, [monthlyTransactions]);

  const points =
    Math.floor(totalInvestedThisMonth / currencyBlockValue) * pointsPerBlock;
  const level = Math.floor(points / 100) + 1;
  const levelLabel = `Nivel ${level}`;
  const pointsLabel = `${points} pts`;

  const plannedVsActualPercent =
    plannedInvestment > 0
      ? clampPercentage((totalInvestedThisMonth / plannedInvestment) * 100)
      : 0;

  const chartData = useMemo(
    () =>
      cards.map((card) => ({
        ...card,
        percent: clampPercentage((card.savedAmount / card.targetAmount) * 100),
      })),
    [cards],
  );

  const flowTotals = useMemo(() => {
    const monthlyNet = monthlyTransactions.reduce(
      (acc, tx) => acc + tx.delta,
      0,
    );
    return {
      invested: Math.max(monthlyNet, 0),
      withdrawn: Math.max(-monthlyNet, 0),
    };
  }, [monthlyTransactions]);

  const monthlyDistribution = useMemo(() => {
    const totals = monthlyTransactions.reduce(
      (acc, tx) => {
        const txType = tx.type || (tx.delta < 0 ? "debt" : "savings");

        if (txType === "debt") {
          acc.debt += Math.abs(tx.delta);
          return acc;
        }

        acc.savings += Math.max(tx.delta, 0);
        return acc;
      },
      { savings: 0, debt: 0 },
    );

    const total = totals.savings + totals.debt;
    return {
      ...totals,
      total,
      savingsPercent: total ? clampPercentage((totals.savings / total) * 100) : 0,
      debtPercent: total ? clampPercentage((totals.debt / total) * 100) : 0,
    };
  }, [monthlyTransactions]);

  const totalDebtPending = useMemo(
    () =>
      debtCards.reduce(
        (acc, debt) => acc + Math.max(debt.totalToPay - debt.paidAmount, 0),
        0,
      ),
    [debtCards],
  );

  const savedTotalAcrossCards = useMemo(
    () => cards.reduce((acc, card) => acc + card.savedAmount, 0),
    [cards],
  );

  const pieByAllCards = useMemo(() => {
    if (!cards.length) {
      return [];
    }

    const denominator =
      savedTotalAcrossCards > 0
        ? savedTotalAcrossCards
        : cards.reduce((acc, card) => acc + card.targetAmount, 0);
    if (!denominator) {
      return [];
    }

    return cards.map((card) => {
      const value =
        savedTotalAcrossCards > 0 ? card.savedAmount : card.targetAmount;
      return {
        ...card,
        piePercent: clampPercentage((value / denominator) * 100),
      };
    });
  }, [cards, savedTotalAcrossCards]);

  const flowBars = useMemo(() => {
    const ordered = [...transactions].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    const today = startOfDay(new Date());

    if (!onboardingCompletedAt && !ordered.length) {
      return [];
    }

    const startingDate = onboardingCompletedAt
      ? startOfDay(new Date(onboardingCompletedAt))
      : parseDateKey(ordered[0].date);

    const txByDay = ordered.reduce((acc, tx) => {
      if (!acc[tx.date]) {
        acc[tx.date] = { savings: 0, debt: 0 };
      }

      const txType = tx.type || (tx.delta < 0 ? "debt" : "savings");
      if (txType === "debt") {
        acc[tx.date].debt += tx.delta;
      } else {
        acc[tx.date].savings += tx.delta;
      }

      return acc;
    }, {});

    const periodMap = {};
    for (
      let cursor = new Date(startingDate);
      cursor <= today;
      cursor = addDays(cursor, 1)
    ) {
      const dateKey = toDateKey(cursor);
      const dayFlow = txByDay[dateKey] || { savings: 0, debt: 0 };
      const periodKey = getPeriodKey(cursor, chartGranularity);

      if (!periodMap[periodKey]) {
        periodMap[periodKey] = {
          id: `flow-${periodKey}`,
          label: getPeriodLabel(cursor, chartGranularity),
          periodStart: getPeriodStart(cursor, chartGranularity),
          savings: 0,
          debt: 0,
        };
      }

      periodMap[periodKey].savings += dayFlow.savings;
      periodMap[periodKey].debt += Math.abs(dayFlow.debt);
    }

    return Object.values(periodMap)
      .sort((a, b) => a.periodStart - b.periodStart)
      .slice(-24);
  }, [transactions, onboardingCompletedAt, chartGranularity]);

  const startedLabel = useMemo(() => {
    if (!onboardingCompletedAt) {
      return "Aún no hay fecha registrada.";
    }

    const start = new Date(onboardingCompletedAt);
    const now = new Date();
    const diffInDays = Math.max(
      0,
      Math.floor((now - start) / (1000 * 60 * 60 * 24)),
    );

    if (diffInDays === 0) {
      return "Empezaste hoy.";
    }

    if (diffInDays < 30) {
      return `Empezaste hace ${diffInDays} día${diffInDays === 1 ? "" : "s"}.`;
    }

    const months = Math.floor(diffInDays / 30);
    return `Empezaste hace ${months} mes${months === 1 ? "" : "es"} aprox.`;
  }, [onboardingCompletedAt]);

  const annualProjection = plannedInvestment * 12;
  const currentWeekStartDate = startOfWeek(new Date());
  const currentWeekKey = toDateKey(currentWeekStartDate);
  const weeklyCheckInCompleted = lastWeeklyCheckInDate
    ? startOfWeek(new Date(lastWeeklyCheckInDate)).getTime() ===
      currentWeekStartDate.getTime()
    : false;
  const isNativeMobile = Platform.OS === "ios" || Platform.OS === "android";

  const dailyTip = useMemo(() => {
    if (!dailyTips.length) {
      return "Cada día cuenta: una pequeña acción hoy vale más que esperar al momento perfecto.";
    }

    const now = new Date();
    const dayOfYear = Math.floor(
      (startOfDay(now) - new Date(now.getFullYear(), 0, 0)) /
        (1000 * 60 * 60 * 24),
    );

    return dailyTips[dayOfYear % dailyTips.length];
  }, [toDateKey(new Date())]);

  const handlePickProfilePhoto = async () => {
    try {
      const picker = await import("expo-image-picker");
      const permission = await picker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setAuthError("Necesitamos permiso para abrir la galería.");
        return;
      }

      const result = await picker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const selectedUri = result.assets[0].uri || "";
      setAccountForm((prev) => ({ ...prev, photo: selectedUri }));
      setUserPhoto(selectedUri);
      setAuthError("");
    } catch {
      setAuthError(
        "No pudimos abrir la galería. Instala expo-image-picker para habilitar esta función.",
      );
    }
  };

  const handleSubmitAuth = async () => {
    if (!accountForm.email.trim() || !accountForm.password.trim()) {
      setAuthError("Completa email y contraseña para continuar.");
      return;
    }

    if (authMode === "register" && !accountForm.name.trim()) {
      setAuthError("Para crear la cuenta necesitamos tu nombre.");
      return;
    }

    if (authMode === "register" && !accountForm.photo.trim()) {
      setAuthError(
        isNativeMobile
          ? "Selecciona una foto desde la galería para crear la cuenta."
          : "Agrega la foto de perfil (URL) para crear la cuenta.",
      );
      return;
    }

    setIsAuthLoading(true);
    setAuthError("");

    try {
      const endpoint =
        authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        authMode === "register"
          ? {
              name: accountForm.name.trim(),
              email: accountForm.email.trim(),
              password: accountForm.password,
            }
          : {
              email: accountForm.email.trim(),
              password: accountForm.password,
            };

      const user = await postJson(endpoint, payload);
      setAuthUserId(user.id);
      setUserName(user.name);
      if (authMode === "register") {
        setUserPhoto(accountForm.photo.trim());
      }
      setAccountForm((prev) => ({ ...prev, name: user.name }));
      setIsAuthenticated(true);

      try {
        const onboardingData = await fetch(
          `${BACKEND_BASE_URL}/api/auth/onboarding/${user.id}`,
        ).then((response) => {
          if (!response.ok) {
            return null;
          }
          return response.json();
        });

        if (onboardingData?.meta) {
          setLandingAnswers({
            meta: onboardingData.meta,
            ritmo: onboardingData.ritmo,
            prioridad: onboardingData.prioridad,
            acompanamiento: onboardingData.acompanamiento,
            monedaBase: onboardingData.moneda_base,
          });
          setSelectedCurrency(onboardingData.moneda_base || "COP");
          setOnboardingCompletedAt(new Date().toISOString());
          setIsOnboardingDone(true);
          setIsPlanSetupPending(false);
        }
      } catch {
        // Si no se puede recuperar onboarding, mantenemos flujo normal.
      }
    } catch (error) {
      setAuthError(error?.message || "No pudimos validar tu cuenta.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!authUserId) {
      setAuthError(
        "Inicia sesión o crea cuenta antes de responder las preguntas.",
      );
      return;
    }

    setIsOnboardingLoading(true);
    setAuthError("");

    try {
      await postJson("/api/auth/onboarding", {
        user_id: authUserId,
        meta: landingAnswers.meta,
        ritmo: landingAnswers.ritmo,
        prioridad: landingAnswers.prioridad,
        acompanamiento: landingAnswers.acompanamiento,
        moneda_base: landingAnswers.monedaBase,
      });
    } catch (error) {
      setAuthError(
        error?.message || "No pudimos guardar tus respuestas ahora.",
      );
      setIsOnboardingLoading(false);
      return;
    }

    const nameByGoal = {
      emergencia: "Plan Respaldo",
      viaje: "Plan Viaje",
      deudas: "Plan Deuda Cero",
      jubilacion: "Plan Jubilación y Gustos",
    };

    setSelectedCurrency(landingAnswers.monedaBase);
    setUserName(accountForm.name.trim() || nameByGoal[landingAnswers.meta]);
    setUserPhoto(accountForm.photo.trim());
    setOnboardingCompletedAt(new Date().toISOString());
    setIsOnboardingDone(true);
    setIsPlanSetupPending(true);
    setIsOnboardingLoading(false);
  };

  const handleSavePlannedInvestment = () => {
    const parsed = Number(draftPlannedInvestment);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return;
    }

    setPlannedInvestment(parsed);
    setIsPlanSetupPending(false);
  };

  const registerTransaction = (delta, type = "savings") => {
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        delta,
        type,
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  const handleAddContribution = (cardId) => {
    setCards((prevCards) => {
      const nextCards = [];
      prevCards.forEach((card) => {
        if (card.id !== cardId) {
          nextCards.push(card);
          return;
        }

        const updatedAmount = card.savedAmount + card.nextContribution;
        registerTransaction(card.nextContribution, "savings");

        if (updatedAmount >= card.targetAmount) {
          const overflow = updatedAmount - card.targetAmount;
          const earnedPoints = Math.round(card.targetAmount / 10);
          setBonusWithdrawnMessage("");
          setBonusAvailable((prevBonus) => prevBonus + overflow);
          setHistoryItems((prevHistory) => [
            {
              id: `${card.id}-history-${Date.now()}`,
              name: card.name,
              description: card.description,
              targetAmount: card.targetAmount,
              points: earnedPoints,
            },
            ...prevHistory,
          ]);
        } else {
          nextCards.push({
            ...card,
            savedAmount: updatedAmount,
          });
        }
      });
      return nextCards;
    });
  };

  const handleRemoveContribution = (cardId) => {
    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id !== cardId) {
          return card;
        }

        const removableAmount = Math.min(
          card.nextContribution,
          card.savedAmount,
        );
        if (removableAmount <= 0) {
          return card;
        }

        registerTransaction(-removableAmount, "savings");

        return {
          ...card,
          savedAmount: card.savedAmount - removableAmount,
        };
      }),
    );
  };

  const handleDeleteCard = (cardId) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  const handleUpdateContribution = (cardId, nextContribution) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId ? { ...card, nextContribution } : card,
      ),
    );
  };

  const handleAddCard = (newCard) => {
    setCards((prevCards) => [...prevCards, newCard]);
    setIsCreateCardVisible(false);
  };

  const handleSaveUser = (updatedUser) => {
    setUserName(updatedUser.userName);
    setPlannedInvestment(updatedUser.plannedInvestment);
  };

  const handleAddDebtCard = (debtCard) => {
    setDebtCards((prev) => [...prev, debtCard]);
    setIsCreateDebtVisible(false);
  };

  const handleAddDebtPayment = (debtId) => {
    setDebtCards((prev) =>
      prev.map((debt) => {
        if (debt.id !== debtId) {
          return debt;
        }

        const nextPaid = Math.min(
          debt.paidAmount + debt.nextContribution,
          debt.totalToPay,
        );
        const delta = nextPaid - debt.paidAmount;
        if (delta > 0) {
          registerTransaction(-delta, "debt");
        }
        return { ...debt, paidAmount: nextPaid };
      }),
    );
  };

  const handleRemoveDebtPayment = (debtId) => {
    setDebtCards((prev) =>
      prev.map((debt) => {
        if (debt.id !== debtId) {
          return debt;
        }

        const removable = Math.min(debt.nextContribution, debt.paidAmount);
        if (removable <= 0) {
          return debt;
        }

        registerTransaction(removable, "debt");
        return { ...debt, paidAmount: debt.paidAmount - removable };
      }),
    );
  };

  const handleSendAiMessage = async () => {
    const message = aiInput.trim();
    if (!message || isAiLoading) {
      return;
    }

    setAiMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: message },
    ]);
    setAiInput("");
    setIsAiLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const backendDetail = await getErrorMessageFromResponse(response);
        const detail = backendDetail ? `: ${backendDetail}` : "";
        throw new Error(`Error del backend (${response.status})${detail}`);
      }

      const data = await response.json();
      const backendText = data?.response?.trim();

      setAiMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text:
            backendText || "No se recibió respuesta de GPT. Intenta de nuevo.",
        },
      ]);
    } catch (error) {
      const isTimeout = error?.name === "AbortError";
      const fallbackText = isTimeout
        ? "La consulta tardó más de lo esperado. Revisa tu conexión o el backend y vuelve a intentar."
        : `No pude conectar con GPT ahora mismo (${error?.message || "sin detalle"}). Si quieres, te invito a un café para contarte del coaching premium con seguimiento personalizado.`;

      setAiMessages((prev) => [
        ...prev,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          text: fallbackText,
        },
      ]);
    } finally {
      clearTimeout(timeout);
      setIsAiLoading(false);
    }
  };

  const handleDailyRecommendation = async () => {
    const { spendingControl, savingsAction, debtAction } = dailyCheckInAnswers;
    if (
      !spendingControl.trim() ||
      !savingsAction.trim() ||
      !debtAction.trim()
    ) {
      setDailyRecommendation(
        "Por favor responde las 3 preguntas para poder darte una recomendación personalizada.",
      );
      return;
    }

    setIsDailyRecommendationLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/ai/daily-recommendation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            spending_control: spendingControl,
            savings_action: savingsAction,
            debt_action: debtAction,
            user_name: userName || "Usuario",
            planned_investment: plannedInvestment,
            saved_this_month: totalInvestedThisMonth + bonusAvailable,
            pending_debt_total: totalDebtPending,
            currency: selectedCurrency,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("No se pudo generar la recomendación diaria.");
      }

      const data = await response.json();
      setDailyRecommendation(
        data.recommendation ||
          "Hoy avanza con una decisión pequeña y sostenible para tu ahorro.",
      );
      setLastWeeklyCheckInDate(new Date().toISOString());
    } catch (error) {
      setDailyRecommendation(
        "No pude conectar con el backend ahora. Como guía rápida: protege tus gastos esenciales, separa una cantidad fija para ahorrar y paga hoy una parte de tu deuda más costosa.",
      );
    } finally {
      setIsDailyRecommendationLoading(false);
    }
  };

  const handleContactPress = () => {
    Linking.openURL("https://wa.me/573000000000").catch(() => {
      setSnapshotMessage("No se pudo abrir el contacto en este dispositivo.");
    });
  };

  const handleWithdrawBonus = () => {
    if (bonusAvailable <= 0) {
      return;
    }

    const amountWithdrawn = bonusAvailable;
    registerTransaction(-amountWithdrawn);
    setBonusAvailable(0);
    setBonusWithdrawnMessage(
      `Retiraste el sobrante de ${formatCurrency(amountWithdrawn, selectedCurrency)}.`,
    );
  };

  const handleDownloadChartExcel = () => {
    if (!candles.length) {
      setSnapshotMessage("No hay datos de velas para exportar todavía.");
      return;
    }

    if (Platform.OS !== "web") {
      setSnapshotMessage(
        "La descarga como Excel está disponible en web por ahora.",
      );
      return;
    }

    const headers = [
      "periodo",
      "apertura",
      "maximo",
      "minimo",
      "cierre",
      "moneda",
      "granularidad",
    ];
    const rows = candles.map((period) => [
      period.label,
      period.open,
      period.high,
      period.low,
      period.close,
      selectedCurrency,
      chartGranularity,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `velas-historicas-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    setSnapshotMessage(
      "Archivo descargado en formato CSV compatible con Excel.",
    );
  };

  if (!isOnboardingDone) {
    return (
      <View
        style={[
          styles.safeArea,
          styles.rootContainer,
          { paddingTop: insets.top },
          isDarkMode ? styles.safeAreaDark : styles.safeAreaLight,
        ]}
      >
        <View style={styles.landingScrollContent}>
          <View
            style={[
              styles.onboardingCard,
              isDarkMode
                ? styles.onboardingCardDark
                : styles.onboardingCardLight,
            ]}
          >
            {!isAuthenticated ? (
              <>
                <Text
                  style={[
                    styles.onboardingTitle,
                    isDarkMode
                      ? styles.onboardingTitleDark
                      : styles.onboardingTitleLight,
                  ]}
                >
                  Bienvenido 👋
                </Text>
                <Text
                  style={[
                    styles.onboardingSubtitle,
                    isDarkMode
                      ? styles.onboardingSubtitleDark
                      : styles.onboardingSubtitleLight,
                  ]}
                >
                  Primero iniciá sesión o creá tu cuenta para guardar tus datos.
                </Text>

                <View style={styles.authTabs}>
                  <Pressable
                    onPress={() => setAuthMode("login")}
                    style={[
                      styles.authTabButton,
                      authMode === "login" && styles.authTabButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.authTabText,
                        authMode === "login" && styles.authTabTextActive,
                      ]}
                    >
                      Iniciar sesión
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setAuthMode("register")}
                    style={[
                      styles.authTabButton,
                      authMode === "register" && styles.authTabButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.authTabText,
                        authMode === "register" && styles.authTabTextActive,
                      ]}
                    >
                      Crear cuenta
                    </Text>
                  </Pressable>
                </View>

                {authMode === "register" && (
                  <>
                    <Text
                      style={[
                        styles.inputLabel,
                        isDarkMode
                          ? styles.inputLabelDark
                          : styles.inputLabelLight,
                      ]}
                    >
                      Nombre
                    </Text>
                    <TextInput
                      value={accountForm.name}
                      onChangeText={(value) =>
                        setAccountForm((prev) => ({ ...prev, name: value }))
                      }
                      style={[
                        styles.input,
                        isDarkMode ? styles.inputDark : styles.inputLight,
                      ]}
                      placeholder="Tu nombre"
                      placeholderTextColor={isDarkMode ? "#525252" : "#737373"}
                    />
                    <Text
                      style={[
                        styles.inputLabel,
                        isDarkMode
                          ? styles.inputLabelDark
                          : styles.inputLabelLight,
                      ]}
                    >
                      Foto de perfil
                    </Text>
                    {isNativeMobile ? (
                      <>
                        <Pressable
                          onPress={handlePickProfilePhoto}
                          style={[
                            styles.galleryButton,
                            isDarkMode
                              ? styles.galleryButtonDark
                              : styles.galleryButtonLight,
                          ]}
                        >
                          <Text
                            style={[
                              styles.galleryButtonText,
                              isDarkMode
                                ? styles.galleryButtonTextDark
                                : styles.galleryButtonTextLight,
                            ]}
                          >
                            Abrir galería
                          </Text>
                        </Pressable>
                        {!!accountForm.photo && (
                          <Text
                            style={[
                              styles.helperText,
                              isDarkMode
                                ? styles.helperTextDark
                                : styles.helperTextLight,
                            ]}
                          >
                            Foto cargada ✅
                          </Text>
                        )}
                      </>
                    ) : (
                      <TextInput
                        value={accountForm.photo}
                        onChangeText={(value) =>
                          setAccountForm((prev) => ({ ...prev, photo: value }))
                        }
                        style={[
                          styles.input,
                          isDarkMode ? styles.inputDark : styles.inputLight,
                        ]}
                        placeholder="https://..."
                        placeholderTextColor={isDarkMode ? "#525252" : "#737373"}
                        autoCapitalize="none"
                      />
                    )}
                  </>
                )}

                <Text
                  style={[
                    styles.inputLabel,
                    isDarkMode ? styles.inputLabelDark : styles.inputLabelLight,
                  ]}
                >
                  Email
                </Text>
                <TextInput
                  value={accountForm.email}
                  onChangeText={(value) =>
                    setAccountForm((prev) => ({ ...prev, email: value }))
                  }
                  style={[
                    styles.input,
                    isDarkMode ? styles.inputDark : styles.inputLight,
                  ]}
                  placeholder="tu@email.com"
                  placeholderTextColor={isDarkMode ? "#525252" : "#737373"}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Text
                  style={[
                    styles.inputLabel,
                    isDarkMode ? styles.inputLabelDark : styles.inputLabelLight,
                  ]}
                >
                  Contraseña
                </Text>
                <TextInput
                  value={accountForm.password}
                  onChangeText={(value) =>
                    setAccountForm((prev) => ({ ...prev, password: value }))
                  }
                  style={[
                    styles.input,
                    isDarkMode ? styles.inputDark : styles.inputLight,
                  ]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={isDarkMode ? "#525252" : "#737373"}
                  secureTextEntry
                />

                {Boolean(authError) && (
                  <Text style={styles.authErrorText}>{authError}</Text>
                )}

                <Pressable
                  onPress={handleSubmitAuth}
                  style={styles.primaryButton}
                  disabled={isAuthLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isAuthLoading
                      ? "Procesando..."
                      : authMode === "register"
                        ? "Crear cuenta"
                        : "Iniciar sesión"}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text
                  style={[
                    styles.onboardingTitle,
                    isDarkMode
                      ? styles.onboardingTitleDark
                      : styles.onboardingTitleLight,
                  ]}
                >
                  Armá tu plan ideal en minutos ✨
                </Text>
                <Text
                  style={[
                    styles.onboardingSubtitle,
                    isDarkMode
                      ? styles.onboardingSubtitleDark
                      : styles.onboardingSubtitleLight,
                  ]}
                >
                  Ahora respondé estas preguntas para personalizar tu plan.
                </Text>

                {landingQuestions.map((question) => (
                  <View key={question.key} style={styles.landingQuestionBlock}>
                    <Text
                      style={[
                        styles.inputLabel,
                        isDarkMode
                          ? styles.inputLabelDark
                          : styles.inputLabelLight,
                      ]}
                    >
                      {question.title}
                    </Text>
                    <View style={styles.moodOptionsRow}>
                      {question.options.map((option) => {
                        const isActive =
                          landingAnswers[question.key] === option.key;
                        return (
                          <Pressable
                            key={option.key}
                            onPress={() =>
                              setLandingAnswers((prev) => ({
                                ...prev,
                                [question.key]: option.key,
                              }))
                            }
                            style={[
                              styles.moodOption,
                              isDarkMode
                                ? styles.moodOptionDark
                                : styles.moodOptionLight,
                              isActive && styles.moodOptionActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.moodOptionText,
                                isDarkMode && styles.moodOptionTextDark,
                                isActive && styles.moodOptionTextActive,
                              ]}
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}

                {Boolean(authError) && (
                  <Text style={styles.authErrorText}>{authError}</Text>
                )}

                <Pressable
                  onPress={handleCompleteOnboarding}
                  style={styles.primaryButton}
                  disabled={isOnboardingLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isOnboardingLoading
                      ? "Guardando..."
                      : "Continuar con mi objetivo"}
                  </Text>
                </Pressable>
              </>
            )}

            <Pressable
              onPress={() => setIsDarkMode((prev) => !prev)}
              style={styles.secondaryThemeButton}
            >
              <Text
                style={[
                  styles.secondaryThemeButtonText,
                  isDarkMode && styles.secondaryThemeButtonTextDark,
                ]}
              >
                {isDarkMode ? "Modo claro" : "Modo oscuro"}
              </Text>
            </Pressable>
          </View>
        </View>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
      </View>
    );
  }

  if (isPlanSetupPending) {
    return (
      <View
        style={[
          styles.safeArea,
          styles.rootContainer,
          { paddingTop: insets.top },
          isDarkMode ? styles.safeAreaDark : styles.safeAreaLight,
        ]}
      >
        <View
          style={[
            styles.onboardingCard,
            isDarkMode ? styles.onboardingCardDark : styles.onboardingCardLight,
          ]}
        >
          <Text
            style={[
              styles.onboardingTitle,
              isDarkMode
                ? styles.onboardingTitleDark
                : styles.onboardingTitleLight,
            ]}
          >
            Último paso 🚀
          </Text>
          <Text
            style={[
              styles.onboardingSubtitle,
              isDarkMode
                ? styles.onboardingSubtitleDark
                : styles.onboardingSubtitleLight,
            ]}
          >
            ¿Cuánto vas a destinar a ahorrar este mes?
          </Text>

          <TextInput
            value={draftPlannedInvestment}
            onChangeText={setDraftPlannedInvestment}
            keyboardType="numeric"
            style={[
              styles.input,
              isDarkMode ? styles.inputDark : styles.inputLight,
            ]}
            placeholder="0"
            placeholderTextColor={isDarkMode ? "#525252" : "#737373"}
          />
          <Text
            style={[
              styles.helperText,
              isDarkMode ? styles.helperTextDark : styles.helperTextLight,
            ]}
          >
            Este valor se muestra en "Destinado a ahorrar" y lo usaremos como tu
            meta mensual.
          </Text>

          <Pressable
            onPress={handleSavePlannedInvestment}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Guardar y entrar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isSavingsTab = activeTab === "ahorro";
  const isDebtTab = activeTab === "deudas";
  const currentPlan = isDebtTab ? "deudas" : "ahorro";

  return (
    <View
      style={[
        styles.safeArea,
        styles.rootContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        isDarkMode ? styles.safeAreaDark : styles.safeAreaLight,
      ]}
    >
      <FlatList
        data={[{ key: activeTab }]}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <Header
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            isDarkMode={isDarkMode}
            userName={userName}
            levelLabel={levelLabel}
            pointsLabel={pointsLabel}
            profilePhoto={userPhoto}
            activePlan={currentPlan}
            onOpenProfile={() => setActiveTab("config")}
            showActionButtons={isSavingsTab || isDebtTab}
          />
        }
        renderItem={() => (
          <>
            {(isSavingsTab || isDebtTab) && (
              <>
                <SummaryCard
                  plannedInvestment={plannedInvestment}
                  actualInvestment={totalInvestedThisMonth}
                  isDarkMode={isDarkMode}
                  currencyCode={selectedCurrency}
                />
                {bonusAvailable > 0 && (
                  <View
                    style={[
                      styles.overflowNotice,
                      isDarkMode
                        ? styles.overflowNoticeDark
                        : styles.overflowNoticeLight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.overflowNoticeText,
                        isDarkMode
                          ? styles.overflowNoticeTextDark
                          : styles.overflowNoticeTextLight,
                      ]}
                    >
                      Tienes un sobrante disponible de{" "}
                      {formatCurrency(bonusAvailable, selectedCurrency)}.
                    </Text>
                    <Pressable
                      onPress={handleWithdrawBonus}
                      style={[
                        styles.withdrawBonusButton,
                        isDarkMode
                          ? styles.withdrawBonusButtonDark
                          : styles.withdrawBonusButtonLight,
                      ]}
                    >
                      <Text
                        style={[
                          styles.withdrawBonusButtonText,
                          isDarkMode
                            ? styles.withdrawBonusButtonTextDark
                            : styles.withdrawBonusButtonTextLight,
                        ]}
                      >
                        Retirar sobrante
                      </Text>
                    </Pressable>
                  </View>
                )}
                {!bonusAvailable && !!bonusWithdrawnMessage && (
                  <View
                    style={[
                      styles.overflowNotice,
                      isDarkMode
                        ? styles.overflowNoticeDark
                        : styles.overflowNoticeLight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.overflowNoticeText,
                        isDarkMode
                          ? styles.overflowNoticeTextDark
                          : styles.overflowNoticeTextLight,
                      ]}
                    >
                      {bonusWithdrawnMessage}
                    </Text>
                  </View>
                )}
                <SectionHeader
                  title={
                    currentPlan === "deudas"
                      ? "Plan de deudas 💳"
                      : "Plan de Ahorro 💳"
                  }
                  createLabel={
                    currentPlan === "deudas"
                      ? "Crear deuda ➕"
                      : "Crear tarjeta ➕"
                  }
                  onCreate={() =>
                    currentPlan === "deudas"
                      ? setIsCreateDebtVisible(true)
                      : setIsCreateCardVisible(true)
                  }
                  isDarkMode={isDarkMode}
                  showCreateButton={false}
                />

                <View style={styles.cardList}>
                  {currentPlan === "deudas" ? (
                    debtCards.length === 0 ? (
                      <Text
                        style={[
                          styles.emptyText,
                          isDarkMode
                            ? styles.emptyTextDark
                            : styles.emptyTextLight,
                        ]}
                      >
                        No hay deudas cargadas. Crea tu primera tarjeta de deuda
                        para empezar.
                      </Text>
                    ) : (
                      debtCards.map((debt) => (
                        <DebtCard
                          key={debt.id}
                          debt={debt}
                          onAddPayment={handleAddDebtPayment}
                          onRemovePayment={handleRemoveDebtPayment}
                          isDarkMode={isDarkMode}
                          currencyCode={selectedCurrency}
                        />
                      ))
                    )
                  ) : cards.length === 0 ? (
                    <Text
                      style={[
                        styles.emptyText,
                        isDarkMode
                          ? styles.emptyTextDark
                          : styles.emptyTextLight,
                      ]}
                    >
                      No hay tarjetas creadas. Crea la primera para empezar.
                    </Text>
                  ) : (
                    cards.map((card) => (
                      <SavingsCard
                        key={card.id}
                        card={card}
                        onAddContribution={handleAddContribution}
                        onRemoveContribution={handleRemoveContribution}
                        onUpdateContribution={handleUpdateContribution}
                        onDeleteCard={handleDeleteCard}
                        isDarkMode={isDarkMode}
                        currencyCode={selectedCurrency}
                      />
                    ))
                  )}
                </View>

                {currentPlan === "ahorro" && (
                  <HistoryCard
                    items={historyItems}
                    isDarkMode={isDarkMode}
                    currencyCode={selectedCurrency}
                  />
                )}
              </>
            )}

            {activeTab === "graficos" && (
              <View
                style={[
                  styles.panel,
                  isDarkMode ? styles.panelDark : styles.panelLight,
                ]}
              >
                <Text
                  style={[
                    styles.panelTitle,
                    isDarkMode ? styles.panelTitleDark : styles.panelTitleLight,
                  ]}
                >
                  Comparativo mensual
                </Text>
                <Text
                  style={[
                    styles.panelSubTitle,
                    isDarkMode
                      ? styles.panelSubTitleDark
                      : styles.panelSubTitleLight,
                  ]}
                >
                  Destinado a ahorrar vs ahorrado real (reinicio mensual).
                </Text>

                <View style={styles.chartRow}>
                  <View style={styles.chartHeader}>
                    <Text
                      style={[
                        styles.chartName,
                        isDarkMode
                          ? styles.chartNameDark
                          : styles.chartNameLight,
                      ]}
                    >
                      Destinado
                    </Text>
                    <Text style={styles.chartAmount}>
                      {formatCurrency(plannedInvestment, selectedCurrency)}
                    </Text>
                  </View>
                  <View style={styles.chartTrack}>
                    <View
                      style={[
                        styles.chartFill,
                        styles.plannedFill,
                        { width: "100%" },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.chartRow}>
                  <View style={styles.chartHeader}>
                    <Text
                      style={[
                        styles.chartName,
                        isDarkMode
                          ? styles.chartNameDark
                          : styles.chartNameLight,
                      ]}
                    >
                      Ahorrado real
                    </Text>
                    <Text style={styles.chartAmount}>
                      {formatCurrency(totalInvestedThisMonth, selectedCurrency)}
                    </Text>
                  </View>
                  <View style={styles.chartTrack}>
                    <View
                      style={[
                        styles.chartFill,
                        styles.actualFill,
                        { width: `${plannedVsActualPercent}%` },
                      ]}
                    />
                  </View>
                </View>

                <Text
                  style={[
                    styles.chartPercent,
                    isDarkMode && styles.chartPercentDark,
                  ]}
                >
                  {plannedVsActualPercent.toFixed(0)}% del objetivo mensual
                </Text>

                {chartData.length > 0 && (
                  <>
                    <Text
                      style={[
                        styles.panelTitle,
                        styles.innerTitle,
                        isDarkMode
                          ? styles.panelTitleDark
                          : styles.panelTitleLight,
                      ]}
                    >
                      Avance por tarjeta
                    </Text>
                    {chartData.map((item) => (
                      <View key={item.id} style={styles.chartRow}>
                        <View style={styles.chartHeader}>
                          <Text
                            style={[
                              styles.chartName,
                              isDarkMode
                                ? styles.chartNameDark
                                : styles.chartNameLight,
                            ]}
                          >
                            {item.name}
                          </Text>
                          <Text
                            style={[
                              styles.chartPercent,
                              isDarkMode && styles.chartPercentDark,
                            ]}
                          >
                            {item.percent.toFixed(0)}%
                          </Text>
                        </View>
                        <View style={styles.chartTrack}>
                          <View
                            style={[
                              styles.chartFill,
                              {
                                width: `${item.percent}%`,
                                backgroundColor: item.color,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {!!pieByAllCards.length && (
                  <>
                    <Text
                      style={[
                        styles.panelTitle,
                        styles.innerTitle,
                        isDarkMode
                          ? styles.panelTitleDark
                          : styles.panelTitleLight,
                      ]}
                    >
                      Torta: participación de todas las tarjetas
                    </Text>
                    <View style={styles.pieRow}>
                      <View style={styles.pieTrack}>
                        {pieByAllCards.map((item) => (
                          <View
                            key={`all-pie-segment-${item.id}`}
                            style={[
                              styles.pieFill,
                              {
                                width: `${item.piePercent}%`,
                                backgroundColor: item.color,
                              },
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                    {pieByAllCards.map((item) => (
                      <Text
                        key={`all-pie-label-${item.id}`}
                        style={[
                          styles.pieLabel,
                          isDarkMode ? styles.chartNameDark : styles.chartNameLight,
                        ]}
                      >
                        {item.name}: {item.piePercent.toFixed(0)}%
                      </Text>
                    ))}
                  </>
                )}

                {!!cards.length && (
                  <>
                    <Text
                      style={[
                        styles.panelTitle,
                        styles.innerTitle,
                        isDarkMode
                          ? styles.panelTitleDark
                          : styles.panelTitleLight,
                      ]}
                    >
                      Torta individual por tarjeta
                    </Text>
                    {cards.map((card) => {
                      const percentSaved = clampPercentage(
                        (card.savedAmount / card.targetAmount) * 100,
                      );
                      const percentPending = 100 - percentSaved;
                      return (
                        <View key={`card-pie-${card.id}`} style={styles.pieRow}>
                          <View style={styles.pieTrack}>
                            <View
                              style={[
                                styles.pieFill,
                                {
                                  width: `${percentSaved}%`,
                                  backgroundColor: card.color,
                                },
                              ]}
                            />
                            <View
                              style={[
                                styles.pieFillSecondary,
                                { width: `${percentPending}%` },
                              ]}
                            />
                          </View>
                          <Text
                            style={[
                              styles.pieLabel,
                              isDarkMode
                                ? styles.chartNameDark
                                : styles.chartNameLight,
                            ]}
                          >
                            {card.name}: {percentSaved.toFixed(0)}% ahorrado /{" "}
                            {percentPending.toFixed(0)}% pendiente
                          </Text>
                        </View>
                      );
                    })}
                  </>
                )}

                <Text
                  style={[
                    styles.panelTitle,
                    styles.innerTitle,
                    isDarkMode ? styles.panelTitleDark : styles.panelTitleLight,
                  ]}
                >
                  Torta mensual: ahorro vs deudas
                </Text>
                <Text
                  style={[
                    styles.panelSubTitle,
                    isDarkMode
                      ? styles.panelSubTitleDark
                      : styles.panelSubTitleLight,
                  ]}
                >
                  Participación del mes actual separada por ahorro y pago de deudas.
                </Text>
                <View style={[styles.monthlyPieCard, styles.candleChartFrameDark]}>
                  <View style={styles.pieTrack}>
                    <View
                      style={[
                        styles.pieFill,
                        {
                          width: `${monthlyDistribution.savingsPercent}%`,
                          backgroundColor: "#22C55E",
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.pieFillSecondary,
                        { width: `${monthlyDistribution.debtPercent}%` },
                      ]}
                    />
                  </View>
                  <Text style={[styles.pieLabel, styles.candleScaleLabelLight]}>
                    Ahorro: {monthlyDistribution.savingsPercent.toFixed(0)}% ({formatCurrency(monthlyDistribution.savings, selectedCurrency)})
                  </Text>
                  <Text style={[styles.pieLabel, styles.candleScaleLabelLight]}>
                    Deudas: {monthlyDistribution.debtPercent.toFixed(0)}% ({formatCurrency(monthlyDistribution.debt, selectedCurrency)})
                  </Text>
                  {!monthlyDistribution.total && (
                    <Text style={[styles.pieLabel, styles.candleScaleLabelLight]}>
                      Aún no hay movimientos este mes.
                    </Text>
                  )}
                </View>
                <View style={styles.legendRow}>
                  <Text
                    style={[
                      styles.legendText,
                      isDarkMode
                        ? styles.panelSubTitleDark
                        : styles.panelSubTitleLight,
                    ]}
                  >
                    Ahorro (verde)
                  </Text>
                  <Text
                    style={[
                      styles.legendText,
                      isDarkMode
                        ? styles.panelSubTitleDark
                        : styles.panelSubTitleLight,
                    ]}
                  >
                    Pago de deudas (azul)
                  </Text>
                </View>

                <Pressable
                  onPress={handleDownloadChartExcel}
                  style={[
                    styles.snapshotButton,
                    styles.snapshotButtonSecondary,
                  ]}
                >
                  <Text style={styles.snapshotButtonSecondaryText}>
                    Descargar como Excel
                  </Text>
                </Pressable>
                {!!snapshotMessage && (
                  <Text
                    style={[
                      styles.snapshotMessage,
                      isDarkMode
                        ? styles.panelSubTitleDark
                        : styles.panelSubTitleLight,
                    ]}
                  >
                    {snapshotMessage}
                  </Text>
                )}

                <Text
                  style={[
                    styles.panelTitle,
                    styles.innerTitle,
                    isDarkMode ? styles.panelTitleDark : styles.panelTitleLight,
                  ]}
                >
                  Balance mensual de movimientos
                </Text>
                <View style={styles.chartRow}>
                  <View style={styles.chartHeader}>
                    <Text
                      style={[
                        styles.chartName,
                        isDarkMode
                          ? styles.chartNameDark
                          : styles.chartNameLight,
                      ]}
                    >
                      Aporte neto
                    </Text>
                    <Text style={styles.chartAmount}>
                      {formatCurrency(flowTotals.invested, selectedCurrency)}
                    </Text>
                  </View>
                  <View style={styles.chartTrack}>
                    <View
                      style={[
                        styles.chartFill,
                        {
                          width: `${flowTotals.invested > 0 ? 100 : 0}%`,
                          backgroundColor: "#FFFFFF",
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.chartRow}>
                  <View style={styles.chartHeader}>
                    <Text
                      style={[
                        styles.chartName,
                        isDarkMode
                          ? styles.chartNameDark
                          : styles.chartNameLight,
                      ]}
                    >
                      Retiro neto
                    </Text>
                    <Text style={styles.chartAmount}>
                      {formatCurrency(flowTotals.withdrawn, selectedCurrency)}
                    </Text>
                  </View>
                  <View style={styles.chartTrack}>
                    <View
                      style={[
                        styles.chartFill,
                        {
                          width: `${flowTotals.withdrawn > 0 ? 100 : 0}%`,
                          backgroundColor: "#FFFFFF",
                        },
                      ]}
                    />
                  </View>
                </View>

                <Text
                  style={[
                    styles.panelSubTitle,
                    isDarkMode
                      ? styles.panelSubTitleDark
                      : styles.panelSubTitleLight,
                  ]}
                >
                  Este indicador muestra el balance neto del mes para evitar
                  acumulaciones engañosas.
                </Text>

                <View
                  style={[
                    styles.coachingCard,
                    isDarkMode
                      ? styles.coachingCardDark
                      : styles.coachingCardLight,
                  ]}
                >
                  <Text
                    style={[
                      styles.coachingTitle,
                      isDarkMode
                        ? styles.emotionalTitleDark
                        : styles.emotionalTitleLight,
                    ]}
                  >
                    Micro coaching diario
                  </Text>
                  <Text
                    style={[
                      styles.coachingTip,
                      isDarkMode
                        ? styles.panelSubTitleDark
                        : styles.panelSubTitleLight,
                    ]}
                  >
                    {dailyTip}
                  </Text>
                </View>
              </View>
            )}

            {activeTab === "config" && (
              <View
                style={[
                  styles.panel,
                  isDarkMode ? styles.panelDark : styles.panelLight,
                ]}
              >
                <Text
                  style={[
                    styles.panelTitle,
                    isDarkMode ? styles.panelTitleDark : styles.panelTitleLight,
                  ]}
                >
                  Configuraciones ⚙️
                </Text>
                <Text
                  style={[
                    styles.panelSubTitle,
                    isDarkMode
                      ? styles.panelSubTitleDark
                      : styles.panelSubTitleLight,
                  ]}
                >
                  Gestiona tema, moneda, foto y datos de tu perfil desde un solo
                  lugar.
                </Text>

                <View style={styles.profileGrid}>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Puntos</Text>
                    <Text style={styles.profileValue}>{pointsLabel}</Text>
                  </View>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Ahorrado real</Text>
                    <Text style={styles.profileValue}>
                      {formatCurrency(
                        totalInvestedThisMonth + bonusAvailable,
                        selectedCurrency,
                      )}
                    </Text>
                  </View>
                  <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Empezaste</Text>
                    <Text style={styles.profileValue}>{startedLabel}</Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.inputLabel,
                    isDarkMode ? styles.inputLabelDark : styles.inputLabelLight,
                  ]}
                >
                  Moneda de cotización
                </Text>
                <View style={styles.currencyRow}>
                  {["COP", "USD"].map((currency) => {
                    const isActive = selectedCurrency === currency;
                    return (
                      <Pressable
                        key={currency}
                        onPress={() => setSelectedCurrency(currency)}
                        style={[
                          styles.currencyButton,
                          isActive && styles.currencyButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.currencyButtonText,
                            isActive && styles.currencyButtonTextActive,
                          ]}
                        >
                          {currency}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text
                  style={[
                    styles.inputLabel,
                    isDarkMode ? styles.inputLabelDark : styles.inputLabelLight,
                  ]}
                >
                  Foto de usuario
                </Text>
                {isNativeMobile ? (
                  <Pressable
                    onPress={handlePickProfilePhoto}
                    style={[
                      styles.galleryButton,
                      isDarkMode ? styles.galleryButtonDark : styles.galleryButtonLight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.galleryButtonText,
                        isDarkMode
                          ? styles.galleryButtonTextDark
                          : styles.galleryButtonTextLight,
                      ]}
                    >
                      Cambiar desde galería
                    </Text>
                  </Pressable>
                ) : (
                  <TextInput
                    value={userPhoto}
                    onChangeText={setUserPhoto}
                    style={[
                      styles.input,
                      isDarkMode ? styles.inputDark : styles.inputLight,
                    ]}
                    placeholder="https://..."
                    placeholderTextColor={isDarkMode ? "#737373" : "#6B7280"}
                    autoCapitalize="none"
                  />
                )}

                <Pressable
                  onPress={handleContactPress}
                  style={styles.profileButton}
                >
                  <Text style={styles.profileButtonText}>
                    Contacto por WhatsApp
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setIsSummaryVisible(true)}
                  style={styles.profileButton}
                >
                  <Text style={styles.profileButtonText}>
                    Editar datos del usuario
                  </Text>
                </Pressable>

                <View
                  style={[
                    styles.coachingCard,
                    isDarkMode
                      ? styles.coachingCardDark
                      : styles.coachingCardLight,
                  ]}
                >
                  <Text
                    style={[
                      styles.coachingTitle,
                      isDarkMode
                        ? styles.emotionalTitleDark
                        : styles.emotionalTitleLight,
                    ]}
                  >
                    Políticas y copyright
                  </Text>
                  <Text
                    style={[
                      styles.panelSubTitle,
                      isDarkMode
                        ? styles.panelSubTitleDark
                        : styles.panelSubTitleLight,
                    ]}
                  >
                    © {new Date().getFullYear()} Tarjetas de Ahorro. Todos los
                    derechos reservados.
                  </Text>
                  <Text
                    style={[
                      styles.panelSubTitle,
                      isDarkMode
                        ? styles.panelSubTitleDark
                        : styles.panelSubTitleLight,
                    ]}
                  >
                    Al usar la app aceptas las políticas de privacidad y uso
                    responsable de la información financiera.
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      />

      <View
        style={[
          styles.bottomNav,
          { bottom: Math.max(insets.bottom, 12) },
          isDarkMode ? styles.bottomNavDark : styles.bottomNavLight,
        ]}
      >
        <Pressable
          onPress={() => setActiveTab("ahorro")}
          style={[styles.navButton, activeTab === "ahorro" && styles.navButtonActive]}
        >
          <MaterialCommunityIcons
            name="piggy-bank-outline"
            size={21}
            color={activeTab === "ahorro" ? "#5B3DF5" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === "ahorro" && styles.navLabelActive,
            ]}
          >
            Ahorro
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("deudas")}
          style={[styles.navButton, activeTab === "deudas" && styles.navButtonActive]}
        >
          <MaterialCommunityIcons
            name="credit-card-outline"
            size={21}
            color={activeTab === "deudas" ? "#5B3DF5" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === "deudas" && styles.navLabelActive,
            ]}
          >
            Deudas
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (activeTab === "deudas") {
              setIsCreateDebtVisible(true);
              return;
            }

            setIsCreateCardVisible(true);
          }}
          style={styles.navButtonCenter}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </Pressable>

        {tabs.map((tab) => {
          if (tab.key === "ahorro" || tab.key === "deudas") {
            return null;
          }

          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.navButton,
                isActive && styles.navButtonActive,
              ]}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={21}
                color={isActive ? "#5B3DF5" : "#9CA3AF"}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <UserSummaryModal
        visible={isSummaryVisible}
        onClose={() => setIsSummaryVisible(false)}
        userName={userName}
        levelLabel={levelLabel}
        pointsLabel={pointsLabel}
        plannedInvestment={plannedInvestment}
        actualInvestment={totalInvestedThisMonth}
        onSave={handleSaveUser}
        isDarkMode={isDarkMode}
        currencyCode={selectedCurrency}
      />
      <CreateCardModal
        visible={isCreateCardVisible}
        onClose={() => setIsCreateCardVisible(false)}
        onSubmit={handleAddCard}
        isDarkMode={isDarkMode}
      />
      <CreateDebtModal
        visible={isCreateDebtVisible}
        onClose={() => setIsCreateDebtVisible(false)}
        onSubmit={handleAddDebtCard}
        isDarkMode={isDarkMode}
      />
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  rootContainer: { paddingHorizontal: 0 },
  safeAreaDark: { backgroundColor: "#000000" },
  safeAreaLight: { backgroundColor: "#FFFFFF" },
  scrollContent: { padding: 20, paddingBottom: 120 },
  cardList: { gap: 16, marginBottom: 24 },
  emptyText: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  emptyTextDark: {
    borderColor: "#FFFFFF",
    color: "#FFFFFF",
    backgroundColor: "#000000",
  },
  emptyTextLight: {
    borderColor: "#000000",
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },
  aiMessagesBox: {
    gap: 8,
    marginBottom: 12,
  },
  aiMessageBubble: {
    borderRadius: 8,
    padding: 10,
    maxWidth: "92%",
  },
  aiMessageAssistant: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
  },
  aiMessageUser: {
    alignSelf: "flex-end",
    backgroundColor: "#111111",
  },
  aiMessageText: {
    color: "#111111",
    fontWeight: "600",
  },
  aiMessageTextUser: {
    color: "#FFFFFF",
  },
  panel: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  panelDark: { backgroundColor: "#000000", borderColor: "#FFFFFF" },
  panelLight: { backgroundColor: "#FFFFFF", borderColor: "#000000" },
  panelTitle: { fontSize: 20, fontWeight: "800" },
  panelTitleDark: { color: "#F8F6F0" },
  panelTitleLight: { color: "#111111" },
  panelSubTitle: { marginTop: 8, marginBottom: 16, fontSize: 13 },
  panelSubTitleDark: { color: "#FFFFFF" },
  panelSubTitleLight: { color: "#000000" },
  innerTitle: { marginTop: 20, marginBottom: 8, fontSize: 16 },
  chartRow: { marginBottom: 14 },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 8,
  },
  chartName: { fontWeight: "700" },
  chartNameDark: { color: "#E5E7EB" },
  chartNameLight: { color: "#111111" },
  chartPercent: { color: "#000000", fontWeight: "800" },
  chartPercentDark: { color: "#FFFFFF" },
  chartTrack: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D4D4D4",
  },
  chartFill: { height: "100%", borderRadius: 999 },
  plannedFill: { backgroundColor: "#FFFFFF" },
  actualFill: { backgroundColor: "#FFFFFF" },
  chartAmount: { color: "#000000", fontSize: 12, fontWeight: "700" },
  pieRow: { marginTop: 10 },
  pieTrack: {
    flexDirection: "row",
    height: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D4D4D4",
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  pieFill: { height: "100%" },
  pieFillSecondary: { height: "100%", backgroundColor: "#D4D4D4" },
  pieLabel: { marginTop: 6, fontSize: 12, fontWeight: "700" },
  zoomButtonsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  zoomButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D4D4D4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  zoomButtonActive: { backgroundColor: "#111111", borderColor: "#111111" },
  zoomButtonText: { fontSize: 12, fontWeight: "700", color: "#111111" },
  zoomButtonTextActive: { color: "#FFFFFF" },
  candleRow: {
    marginTop: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    minHeight: 170,
    paddingRight: 56,
  },
  candleChartFrame: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#2B2B2B",
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  candleChartFrameDark: { backgroundColor: "#101010" },
  candleChartFrameLight: { backgroundColor: "#101010" },
  candleScaleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 10,
    zIndex: 2,
  },
  candleScaleLabel: { fontSize: 11, fontWeight: "700" },
  candleScaleLabelLight: { color: "#FFFFFF" },
  candleGrid: {
    ...StyleSheet.absoluteFillObject,
    top: 30,
    left: 0,
    right: 0,
    bottom: 30,
  },
  candleGridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  candleGridLineDark: { borderTopColor: "#1F2A44" },
  candleGridLineLight: { borderTopColor: "#3A3A3A" },
  rightAxisLine: {
    position: "absolute",
    right: 40,
    top: 36,
    bottom: 30,
    borderRightWidth: 1,
    borderRightColor: "#4B5563",
  },
  rightAxisLabels: {
    position: "absolute",
    right: 8,
    top: 30,
    bottom: 30,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  rightAxisLabelText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  candleItem: { alignItems: "center", width: 42, marginRight: 6 },
  groupedBarsWrap: {
    height: 126,
    width: 24,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 4,
  },
  groupedBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 4,
  },
  groupedBarSavings: { backgroundColor: "#22C55E" },
  groupedBarDebt: { backgroundColor: "#2563EB" },
  candleLabel: { marginTop: 8, fontSize: 11, fontWeight: "700" },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  legendText: { fontSize: 12, fontWeight: "700" },
  timeAxisLine: {
    position: "absolute",
    left: 0,
    right: 40,
    bottom: 30,
    borderTopWidth: 1,
  },
  timeAxisLineDark: { borderTopColor: "#525252" },
  timeAxisLineLight: { borderTopColor: "#525252" },
  snapshotButton: {
    borderRadius: 3,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  snapshotButtonSecondary: {
    backgroundColor: "#111827",
    borderColor: "#1F2937",
    marginBottom: 4,
  },
  snapshotButtonSecondaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  snapshotMessage: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  profileGrid: { marginTop: 12, gap: 10 },
  profileItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#000000",
  },
  profileLabel: { color: "#000000", fontSize: 12 },
  profileValue: {
    marginTop: 4,
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
  },
  profileHint: { marginTop: 10, fontSize: 12, fontWeight: "600" },
  profileButton: {
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: "#000000",
    alignItems: "center",
    paddingVertical: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.38,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  profileButtonText: { color: "#FFFFFF", fontWeight: "800" },
  overflowNotice: {
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  overflowNoticeDark: { backgroundColor: "#1F1F1F", borderColor: "#FFFFFF" },
  overflowNoticeLight: { backgroundColor: "#FFFFFF", borderColor: "#000000" },
  overflowNoticeText: { fontSize: 13, fontWeight: "700" },
  overflowNoticeTextDark: { color: "#FFFFFF" },
  overflowNoticeTextLight: { color: "#000000" },
  withdrawBonusButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  withdrawBonusButtonDark: {
    backgroundColor: "#7F1D1D",
    borderColor: "#991B1B",
  },
  withdrawBonusButtonLight: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  withdrawBonusButtonText: { fontWeight: "700", fontSize: 12 },
  withdrawBonusButtonTextDark: { color: "#FEE2E2" },
  withdrawBonusButtonTextLight: { color: "#FFFFFF" },
  bottomNav: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 26,
    paddingHorizontal: 8,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  bottomNavDark: { backgroundColor: "#111111", borderColor: "#1F2937" },
  bottomNavLight: { backgroundColor: "#111111", borderColor: "#1F2937" },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 16,
  },
  navButtonCenter: {
    marginTop: -28,
    borderRadius: 999,
    width: 68,
    maxWidth: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#1F2937",
    borderWidth: 4,
    borderColor: "#111111",
  },
  monthlyPieCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  navButtonActive: { backgroundColor: "#1F2937" },
  navLabel: { color: "#9CA3AF", fontSize: 11, fontWeight: "700" },
  navLabelActive: { color: "#5B3DF5" },

  onboardingCard: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  onboardingCardDark: { backgroundColor: "#000000", borderColor: "#FFFFFF" },
  onboardingCardLight: { backgroundColor: "#FFFFFF", borderColor: "#000000" },
  onboardingTitle: { fontSize: 24, fontWeight: "800" },
  onboardingTitleDark: { color: "#F8F6F0" },
  onboardingTitleLight: { color: "#111111" },
  onboardingSubtitle: { marginTop: 8, marginBottom: 18, fontSize: 14 },
  onboardingSubtitleDark: { color: "#FFFFFF" },
  onboardingSubtitleLight: { color: "#000000" },
  landingScrollContent: { flex: 1, paddingVertical: 20 },
  authTabs: { flexDirection: "row", gap: 8, marginBottom: 12 },
  authTabButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#000000",
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  authTabButtonActive: { backgroundColor: "#000000", borderColor: "#000000" },
  authTabText: { color: "#000000", fontWeight: "700" },
  authTabTextActive: { color: "#FFFFFF" },
  authErrorText: {
    marginTop: 10,
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "700",
  },
  landingQuestionBlock: { marginBottom: 8 },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 8,
  },
  inputLabelDark: { color: "#FFFFFF" },
  inputLabelLight: { color: "#000000" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputDark: {
    borderColor: "#FFFFFF",
    color: "#F9FAFB",
    backgroundColor: "#111111",
  },
  inputLight: {
    borderColor: "#000000",
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },

  galleryButton: {
    marginTop: 2,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  galleryButtonDark: { backgroundColor: "#111111", borderColor: "#FFFFFF" },
  galleryButtonLight: { backgroundColor: "#FFFFFF", borderColor: "#000000" },
  galleryButtonText: { fontWeight: "700" },
  galleryButtonTextDark: { color: "#FFFFFF" },
  galleryButtonTextLight: { color: "#000000" },
  helperText: { marginTop: 8, fontSize: 11, fontWeight: "600" },
  helperTextDark: { color: "#FFFFFF" },
  helperTextLight: { color: "#404040" },
  primaryButton: {
    marginTop: 18,
    backgroundColor: "#000000",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700" },
  secondaryThemeButton: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 8,
  },
  secondaryThemeButtonText: { color: "#000000", fontWeight: "700" },
  secondaryThemeButtonTextDark: { color: "#FFFFFF" },
  currencyRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  granularityRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  currencyButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  currencyButtonActive: { backgroundColor: "#000000", borderColor: "#000000" },
  currencyButtonText: { color: "#000000", fontWeight: "700" },
  currencyButtonTextActive: { color: "#FFFFFF" },
  emotionalTitle: { fontSize: 18, fontWeight: "800" },
  emotionalTitleDark: { color: "#FFFFFF" },
  emotionalTitleLight: { color: "#111111" },
  moodOptionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  moodOption: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  moodOptionDark: { borderColor: "#FFFFFF", backgroundColor: "#1F1F1F" },
  moodOptionLight: { borderColor: "#000000", backgroundColor: "#FFFFFF" },
  moodOptionActive: { backgroundColor: "#000000", borderColor: "#000000" },
  moodOptionText: { color: "#000000", fontSize: 12, fontWeight: "700" },
  moodOptionTextDark: { color: "#FFFFFF" },
  moodOptionTextActive: { color: "#FFFFFF" },
  coachingCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  coachingCardDark: { backgroundColor: "#111111", borderColor: "#FFFFFF" },
  coachingCardLight: { backgroundColor: "#FFFFFF", borderColor: "#000000" },
  coachingTitle: { fontSize: 16, fontWeight: "800" },
  coachingTip: { marginTop: 8, fontSize: 13, fontWeight: "700" },
  coachingRecommendation: { marginTop: 6, fontSize: 13 },
});
