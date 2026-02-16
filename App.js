import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';

import CreateCardModal from './components/CreateCardModal';
import Header from './components/Header';
import HistoryCard from './components/HistoryCard';
import SavingsCard from './components/SavingsCard';
import SectionHeader from './components/SectionHeader';
import SummaryCard from './components/SummaryCard';
import UserSummaryModal from './components/UserSummaryModal';
import dailyTips from './data/dailyTips';
import savingsCards from './data/savingsCards';
import { clampPercentage, formatCurrency } from './utils/formatters';

const tabs = [
  { key: 'inicio', label: 'Inicio 🏠' },
  { key: 'graficos', label: 'Gráficos 📊' },
  { key: 'perfil', label: 'Perfil 👤' },
];


const landingQuestions = [
  {
    key: 'meta',
    title: '1. ¿Qué meta querés cumplir primero?',
    options: [
      { key: 'emergencia', label: 'Fondo de emergencia' },
      { key: 'viaje', label: 'Viaje o descanso' },
      { key: 'deudas', label: 'Pagar deudas' },
      { key: 'jubilacion', label: 'Jubilación y gustos' },
    ],
  },
  {
    key: 'ritmo',
    title: '2. ¿Cada cuánto te gustaría ahorrar?',
    options: [
      { key: 'diario', label: 'Todos los días' },
      { key: 'semanal', label: 'Cada semana' },
      { key: 'mensual', label: 'Al mes' },
    ],
  },
  {
    key: 'prioridad',
    title: '3. ¿Qué te importa más este mes?',
    options: [
      { key: 'constancia', label: 'No cortar la racha' },
      { key: 'equilibrio', label: 'Avanzar sin presionarme' },
      { key: 'avance', label: 'Crecer lo más rápido posible' },
    ],
  },
  {
    key: 'acompanamiento',
    title: '4. ¿Cómo querés el acompañamiento de la app?',
    options: [
      { key: 'ligero', label: 'Simple y rápido' },
      { key: 'retos', label: 'Con retos y motivación' },
      { key: 'detalle', label: 'Con más detalle y datos' },
    ],
  },
  {
    key: 'monedaBase',
    title: '5. ¿Qué moneda vas a usar?',
    options: [
      { key: 'COP', label: 'Pesos (COP)' },
      { key: 'USD', label: 'Dólares (USD)' },
    ],
  },
];

const toDateKey = (date) => date.toISOString().slice(0, 10);
const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
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
const formatShortDate = (value) => value.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
const formatMonthLabel = (value) => value.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
const getPeriodKey = (value, granularity) => {
  if (granularity === 'month') {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
  }

  if (granularity === 'week') {
    return toDateKey(startOfWeek(value));
  }

  return toDateKey(value);
};
const getPeriodStart = (value, granularity) => {
  if (granularity === 'month') {
    return startOfMonth(value);
  }

  if (granularity === 'week') {
    return startOfWeek(value);
  }

  return startOfDay(value);
};
const getPeriodLabel = (value, granularity) => {
  if (granularity === 'month') {
    return formatMonthLabel(value);
  }

  if (granularity === 'week') {
    const start = startOfWeek(value);
    const end = addDays(start, 6);
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
  }

  return value.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
};

export default function App() {
  const [cards, setCards] = useState(savingsCards);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [plannedInvestment, setPlannedInvestment] = useState(0);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isCreateCardVisible, setIsCreateCardVisible] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [bonusAvailable, setBonusAvailable] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const [isOnboardingDone, setIsOnboardingDone] = useState(false);
  const [isPlanSetupPending, setIsPlanSetupPending] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: '', email: '', password: '' });
  const [draftPlannedInvestment, setDraftPlannedInvestment] = useState('');
  const [landingAnswers, setLandingAnswers] = useState({
    meta: 'emergencia',
    ritmo: 'semanal',
    prioridad: 'equilibrio',
    acompanamiento: 'ligero',
    monedaBase: 'COP',
  });
  const [selectedCurrency, setSelectedCurrency] = useState('COP');
  const [transactions, setTransactions] = useState([]);
  const [chartGranularity, setChartGranularity] = useState('day');
  const [bonusWithdrawnMessage, setBonusWithdrawnMessage] = useState('');
  const [dailyTip] = useState(dailyTips[0]);
  const [onboardingCompletedAt, setOnboardingCompletedAt] = useState('');
  const [snapshotMessage, setSnapshotMessage] = useState('');

  const pointsPerBlock = 50;
  const currencyBlockValue = selectedCurrency === 'USD' ? 100 : 100000;
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const monthlyTransactions = useMemo(
    () => transactions.filter((tx) => tx.date.startsWith(currentMonthKey)),
    [transactions, currentMonthKey],
  );

  const totalInvestedThisMonth = useMemo(() => {
    const monthlyNet = monthlyTransactions.reduce((acc, tx) => acc + tx.delta, 0);
    return Math.max(monthlyNet, 0);
  }, [monthlyTransactions]);

  const points = Math.floor(totalInvestedThisMonth / currencyBlockValue) * pointsPerBlock;
  const level = Math.floor(points / 100) + 1;
  const levelLabel = `Nivel ${level}`;
  const pointsLabel = `${points} pts`;

  const plannedVsActualPercent = plannedInvestment > 0
    ? clampPercentage((totalInvestedThisMonth / plannedInvestment) * 100)
    : 0;

  const chartData = useMemo(
    () => cards.map((card) => ({ ...card, percent: clampPercentage((card.savedAmount / card.targetAmount) * 100) })),
    [cards],
  );

  const flowTotals = useMemo(() => {
    const monthlyNet = monthlyTransactions.reduce((acc, tx) => acc + tx.delta, 0);
    return {
      invested: Math.max(monthlyNet, 0),
      withdrawn: Math.max(-monthlyNet, 0),
    };
  }, [monthlyTransactions]);

  const savedTotalAcrossCards = useMemo(
    () => cards.reduce((acc, card) => acc + card.savedAmount, 0),
    [cards],
  );

  const pieByAllCards = useMemo(() => {
    if (!cards.length) {
      return [];
    }

    const denominator = savedTotalAcrossCards > 0 ? savedTotalAcrossCards : cards.reduce((acc, card) => acc + card.targetAmount, 0);
    if (!denominator) {
      return [];
    }

    return cards.map((card) => {
      const value = savedTotalAcrossCards > 0 ? card.savedAmount : card.targetAmount;
      return {
        ...card,
        piePercent: clampPercentage((value / denominator) * 100),
      };
    });
  }, [cards, savedTotalAcrossCards]);

  const candles = useMemo(() => {
    const ordered = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    const today = startOfDay(new Date());

    if (!onboardingCompletedAt && !ordered.length) {
      return [];
    }

    const startingDate = onboardingCompletedAt
      ? startOfDay(new Date(onboardingCompletedAt))
      : parseDateKey(ordered[0].date);

    const txByDay = ordered.reduce((acc, tx) => {
      acc[tx.date] = (acc[tx.date] || 0) + tx.delta;
      return acc;
    }, {});

    const periodMap = {};
    let runningBalance = 0;
    for (let cursor = new Date(startingDate); cursor <= today; cursor = addDays(cursor, 1)) {
      const dateKey = toDateKey(cursor);
      const delta = txByDay[dateKey] || 0;
      const openValue = runningBalance;
      const closeValue = runningBalance + delta;
      const highValue = Math.max(openValue, closeValue);
      const lowValue = Math.min(openValue, closeValue);
      const periodKey = getPeriodKey(cursor, chartGranularity);

      if (!periodMap[periodKey]) {
        periodMap[periodKey] = {
          id: `candle-${periodKey}`,
          label: getPeriodLabel(cursor, chartGranularity),
          periodStart: getPeriodStart(cursor, chartGranularity),
          open: openValue,
          close: closeValue,
          high: highValue,
          low: lowValue,
        };
      } else {
        periodMap[periodKey].close = closeValue;
        periodMap[periodKey].high = Math.max(periodMap[periodKey].high, highValue);
        periodMap[periodKey].low = Math.min(periodMap[periodKey].low, lowValue);
      }

      runningBalance = closeValue;
    }

    return Object.values(periodMap)
      .sort((a, b) => a.periodStart - b.periodStart)
      .slice(-24);
  }, [transactions, onboardingCompletedAt, chartGranularity]);

  const candlesScale = useMemo(() => {
    if (!candles.length) {
      return 1;
    }

    const highs = candles.map((period) => period.high);
    const lows = candles.map((period) => period.low);
    const range = Math.max(...highs) - Math.min(...lows);

    return range || 1;
  }, [candles]);

  const candlesBounds = useMemo(() => {
    if (!candles.length) {
      return { max: 0, min: 0 };
    }

    return {
      max: Math.max(...candles.map((period) => period.high)),
      min: Math.min(...candles.map((period) => period.low)),
    };
  }, [candles]);

  const startedLabel = useMemo(() => {
    if (!onboardingCompletedAt) {
      return 'Aún no hay fecha registrada.';
    }

    const start = new Date(onboardingCompletedAt);
    const now = new Date();
    const diffInDays = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));

    if (diffInDays === 0) {
      return 'Empezaste hoy.';
    }

    if (diffInDays < 30) {
      return `Empezaste hace ${diffInDays} día${diffInDays === 1 ? '' : 's'}.`;
    }

    const months = Math.floor(diffInDays / 30);
    return `Empezaste hace ${months} mes${months === 1 ? '' : 'es'} aprox.`;
  }, [onboardingCompletedAt]);

  const annualProjection = plannedInvestment * 12;

  const handleCompleteOnboarding = () => {
    if (!accountForm.name.trim() || !accountForm.email.trim() || !accountForm.password.trim()) {
      return;
    }

    const nameByGoal = {
      emergencia: 'Plan Respaldo',
      viaje: 'Plan Viaje',
      deudas: 'Plan Deuda Cero',
      jubilacion: 'Plan Jubilación y Gustos',
    };

    setSelectedCurrency(landingAnswers.monedaBase);
    setUserName(accountForm.name.trim() || nameByGoal[landingAnswers.meta]);
    setUserPhoto('https://i.pravatar.cc/160?img=12');
    setOnboardingCompletedAt(new Date().toISOString());
    setIsOnboardingDone(true);
    setIsPlanSetupPending(true);
  };

  const handleSavePlannedInvestment = () => {
    const parsed = Number(draftPlannedInvestment);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return;
    }

    setPlannedInvestment(parsed);
    setIsPlanSetupPending(false);
  };

  const registerTransaction = (delta) => {
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        delta,
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
        registerTransaction(card.nextContribution);

        if (updatedAmount >= card.targetAmount) {
          const overflow = updatedAmount - card.targetAmount;
          const earnedPoints = Math.round(card.targetAmount / 10);
          setBonusWithdrawnMessage('');
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
    setCards((prevCards) => prevCards.map((card) => {
      if (card.id !== cardId) {
        return card;
      }

      const removableAmount = Math.min(card.nextContribution, card.savedAmount);
      if (removableAmount <= 0) {
        return card;
      }

      registerTransaction(-removableAmount);

      return {
        ...card,
        savedAmount: card.savedAmount - removableAmount,
      };
    }));
  };

  const handleDeleteCard = (cardId) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  const handleUpdateContribution = (cardId, nextContribution) => {
    setCards((prevCards) => prevCards.map((card) => (
      card.id === cardId
        ? { ...card, nextContribution }
        : card
    )));
  };

  const handleAddCard = (newCard) => {
    setCards((prevCards) => [...prevCards, newCard]);
    setIsCreateCardVisible(false);
  };

  const handleSaveUser = (updatedUser) => {
    setUserName(updatedUser.userName);
    setPlannedInvestment(updatedUser.plannedInvestment);
  };

  const handleWithdrawBonus = () => {
    if (bonusAvailable <= 0) {
      return;
    }

    const amountWithdrawn = bonusAvailable;
    registerTransaction(-amountWithdrawn);
    setBonusAvailable(0);
    setBonusWithdrawnMessage(`Retiraste el sobrante de ${formatCurrency(amountWithdrawn, selectedCurrency)}.`);
  };

  const handleDownloadChartExcel = () => {
    if (!candles.length) {
      setSnapshotMessage('No hay datos de velas para exportar todavía.');
      return;
    }

    if (Platform.OS !== 'web') {
      setSnapshotMessage('La descarga como Excel está disponible en web por ahora.');
      return;
    }

    const headers = ['periodo', 'apertura', 'maximo', 'minimo', 'cierre', 'moneda', 'granularidad'];
    const rows = candles.map((period) => [
      period.label,
      period.open,
      period.high,
      period.low,
      period.close,
      selectedCurrency,
      chartGranularity,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `velas-historicas-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    setSnapshotMessage('Archivo descargado en formato CSV compatible con Excel.');
  };

  if (!isOnboardingDone) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode ? styles.safeAreaDark : styles.safeAreaLight]}>
        <ScrollView contentContainerStyle={styles.landingScrollContent}>
          <View style={[styles.onboardingCard, isDarkMode ? styles.onboardingCardDark : styles.onboardingCardLight]}>
            <Text style={[styles.onboardingTitle, isDarkMode ? styles.onboardingTitleDark : styles.onboardingTitleLight]}>
              Armá tu plan ideal en minutos ✨
            </Text>
            <Text style={[styles.onboardingSubtitle, isDarkMode ? styles.onboardingSubtitleDark : styles.onboardingSubtitleLight]}>
              En 5 minutos podés tener tu plan de ahorro armado.
            </Text>

            <Text style={[styles.inputLabel, isDarkMode ? styles.inputLabelDark : styles.inputLabelLight]}>Nombre</Text>
            <TextInput
              value={accountForm.name}
              onChangeText={(value) => setAccountForm((prev) => ({ ...prev, name: value }))}
              style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
              placeholder="Tu nombre"
              placeholderTextColor={isDarkMode ? '#525252' : '#737373'}
            />
            <Text style={[styles.inputLabel, isDarkMode ? styles.inputLabelDark : styles.inputLabelLight]}>Email</Text>
            <TextInput
              value={accountForm.email}
              onChangeText={(value) => setAccountForm((prev) => ({ ...prev, email: value }))}
              style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
              placeholder="tu@email.com"
              placeholderTextColor={isDarkMode ? '#525252' : '#737373'}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Text style={[styles.inputLabel, isDarkMode ? styles.inputLabelDark : styles.inputLabelLight]}>Contraseña</Text>
            <TextInput
              value={accountForm.password}
              onChangeText={(value) => setAccountForm((prev) => ({ ...prev, password: value }))}
              style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={isDarkMode ? '#525252' : '#737373'}
              secureTextEntry
            />

            {landingQuestions.map((question) => (
              <View key={question.key} style={styles.landingQuestionBlock}>
                <Text style={[styles.inputLabel, isDarkMode ? styles.inputLabelDark : styles.inputLabelLight]}>{question.title}</Text>
                <View style={styles.moodOptionsRow}>
                  {question.options.map((option) => {
                    const isActive = landingAnswers[question.key] === option.key;
                    return (
                      <Pressable
                        key={option.key}
                        onPress={() => setLandingAnswers((prev) => ({ ...prev, [question.key]: option.key }))}
                        style={[
                          styles.moodOption,
                          isDarkMode ? styles.moodOptionDark : styles.moodOptionLight,
                          isActive && styles.moodOptionActive,
                        ]}
                      >
                        <Text style={[styles.moodOptionText, isDarkMode && styles.moodOptionTextDark, isActive && styles.moodOptionTextActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            <Pressable onPress={handleCompleteOnboarding} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Crear mi primer objetivo</Text>
            </Pressable>
            <Pressable onPress={() => setIsDarkMode((prev) => !prev)} style={styles.secondaryThemeButton}>
              <Text style={[styles.secondaryThemeButtonText, isDarkMode && styles.secondaryThemeButtonTextDark]}>{isDarkMode ? 'Modo claro' : 'Modo oscuro'}</Text>
            </Pressable>
          </View>
        </ScrollView>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </SafeAreaView>
    );
  }


  if (isPlanSetupPending) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode ? styles.safeAreaDark : styles.safeAreaLight]}>
        <View style={[styles.onboardingCard, isDarkMode ? styles.onboardingCardDark : styles.onboardingCardLight]}>
          <Text style={[styles.onboardingTitle, isDarkMode ? styles.onboardingTitleDark : styles.onboardingTitleLight]}>
            Último paso 🚀
          </Text>
          <Text style={[styles.onboardingSubtitle, isDarkMode ? styles.onboardingSubtitleDark : styles.onboardingSubtitleLight]}>
            ¿Cuánto vas a destinar a ahorrar este mes?
          </Text>

          <TextInput
            value={draftPlannedInvestment}
            onChangeText={setDraftPlannedInvestment}
            keyboardType="numeric"
            style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
            placeholder="0"
            placeholderTextColor={isDarkMode ? '#525252' : '#737373'}
          />
          <Text style={[styles.helperText, isDarkMode ? styles.helperTextDark : styles.helperTextLight]}>
            Este valor se muestra en "Destinado a ahorrar" y lo usaremos como tu meta mensual.
          </Text>

          <Pressable onPress={handleSavePlannedInvestment} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Guardar y entrar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode ? styles.safeAreaDark : styles.safeAreaLight]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          isDarkMode={isDarkMode}
          userName={userName}
          levelLabel={levelLabel}
          pointsLabel={pointsLabel}
          profilePhoto={userPhoto}
        />

        {activeTab === 'inicio' && (
          <>
            <SummaryCard
              plannedInvestment={plannedInvestment}
              actualInvestment={totalInvestedThisMonth}
              isDarkMode={isDarkMode}
              currencyCode={selectedCurrency}
            />
            {bonusAvailable > 0 && (
              <View style={[styles.overflowNotice, isDarkMode ? styles.overflowNoticeDark : styles.overflowNoticeLight]}>
                <Text style={[styles.overflowNoticeText, isDarkMode ? styles.overflowNoticeTextDark : styles.overflowNoticeTextLight]}>
                  Tienes un sobrante disponible de {formatCurrency(bonusAvailable, selectedCurrency)}.
                </Text>
                <Pressable
                  onPress={handleWithdrawBonus}
                  style={[styles.withdrawBonusButton, isDarkMode ? styles.withdrawBonusButtonDark : styles.withdrawBonusButtonLight]}
                >
                  <Text style={[styles.withdrawBonusButtonText, isDarkMode ? styles.withdrawBonusButtonTextDark : styles.withdrawBonusButtonTextLight]}>
                    Retirar sobrante
                  </Text>
                </Pressable>
              </View>
            )}
            {!bonusAvailable && !!bonusWithdrawnMessage && (
              <View style={[styles.overflowNotice, isDarkMode ? styles.overflowNoticeDark : styles.overflowNoticeLight]}>
                <Text style={[styles.overflowNoticeText, isDarkMode ? styles.overflowNoticeTextDark : styles.overflowNoticeTextLight]}>
                  {bonusWithdrawnMessage}
                </Text>
              </View>
            )}
            <SectionHeader onCreate={() => setIsCreateCardVisible(true)} isDarkMode={isDarkMode} />

            <View style={styles.cardList}>
              {cards.length === 0 ? (
                <Text style={[styles.emptyText, isDarkMode ? styles.emptyTextDark : styles.emptyTextLight]}>
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


            <HistoryCard items={historyItems} isDarkMode={isDarkMode} currencyCode={selectedCurrency} />
          </>
        )}

        {activeTab === 'graficos' && (
          <View style={[styles.panel, isDarkMode ? styles.panelDark : styles.panelLight]}>
            <Text style={[styles.panelTitle, isDarkMode ? styles.panelTitleDark : styles.panelTitleLight]}>
              Comparativo mensual
            </Text>
            <Text style={[styles.panelSubTitle, isDarkMode ? styles.panelSubTitleDark : styles.panelSubTitleLight]}>
            Destinado a ahorrar vs ahorrado real (reinicio mensual).
            </Text>

            <View style={styles.granularityRow}>
              {[
                { key: 'day', label: 'Diaria' },
                { key: 'week', label: 'Semanal' },
                { key: 'month', label: 'Mensual' },
              ].map((option) => {
                const isActive = chartGranularity === option.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setChartGranularity(option.key)}
                    style={[styles.currencyButton, isActive && styles.currencyButtonActive]}
                  >
                    <Text style={[styles.currencyButtonText, isActive && styles.currencyButtonTextActive]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.chartRow}>
              <View style={styles.chartHeader}>
                <Text style={[styles.chartName, isDarkMode ? styles.chartNameDark : styles.chartNameLight]}>Destinado</Text>
                <Text style={styles.chartAmount}>{formatCurrency(plannedInvestment, selectedCurrency)}</Text>
              </View>
              <View style={styles.chartTrack}>
                <View style={[styles.chartFill, styles.plannedFill, { width: '100%' }]} />
              </View>
            </View>

            <View style={styles.chartRow}>
              <View style={styles.chartHeader}>
                <Text style={[styles.chartName, isDarkMode ? styles.chartNameDark : styles.chartNameLight]}>Ahorrado real</Text>
                <Text style={styles.chartAmount}>{formatCurrency(totalInvestedThisMonth, selectedCurrency)}</Text>
              </View>
              <View style={styles.chartTrack}>
                <View style={[styles.chartFill, styles.actualFill, { width: `${plannedVsActualPercent}%` }]} />
              </View>
            </View>

            <Text style={[styles.chartPercent, isDarkMode && styles.chartPercentDark]}>{plannedVsActualPercent.toFixed(0)}% del objetivo mensual</Text>

            {chartData.length > 0 && (
              <>
                <Text style={[styles.panelTitle, styles.innerTitle, isDarkMode ? styles.panelTitleDark : styles.panelTitleLight]}>
                  Avance por tarjeta
                </Text>
                {chartData.map((item) => (
                  <View key={item.id} style={styles.chartRow}>
                    <View style={styles.chartHeader}>
                      <Text style={[styles.chartName, isDarkMode ? styles.chartNameDark : styles.chartNameLight]}>{item.name}</Text>
                      <Text style={[styles.chartPercent, isDarkMode && styles.chartPercentDark]}>{item.percent.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.chartTrack}>
                      <View style={[styles.chartFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
                    </View>
                  </View>
                ))}
              </>
            )}

            {!!pieByAllCards.length && (
              <>
                <Text style={[styles.panelTitle, styles.innerTitle, isDarkMode ? styles.panelTitleDark : styles.panelTitleLight]}>
                  Torta: participación de todas las tarjetas
                </Text>
                {pieByAllCards.map((item) => (
                  <View key={`all-pie-${item.id}`} style={styles.pieRow}>
                    <View style={styles.pieTrack}>
                      <View style={[styles.pieFill, { width: `${item.piePercent}%`, backgroundColor: item.color }]} />
                    </View>
                    <Text style={[styles.pieLabel, isDarkMode ? styles.chartNameDark : styles.chartNameLight]}>
                      {item.name}: {item.piePercent.toFixed(0)}%
                    </Text>
                  </View>
                ))}
              </>
            )}

            {!!cards.length && (
              <>
                <Text style={[styles.panelTitle, styles.innerTitle, isDarkMode ? styles.panelTitleDark : styles.panelTitleLight]}>
                  Torta individual por tarjeta
                </Text>
                {cards.map((card) => {
                  const percentSaved = clampPercentage((card.savedAmount / card.targetAmount) * 100);
                  const percentPending = 100 - percentSaved;
                  return (
                    <View key={`card-pie-${card.id}`} style={styles.pieRow}>
                      <View style={styles.pieTrack}>
                        <View style={[styles.pieFill, { width: `${percentSaved}%`, backgroundColor: card.color }]} />
                        <View style={[styles.pieFillSecondary, { width: `${percentPending}%` }]} />
                      </View>
                      <Text style={[styles.pieLabel, isDarkMode ? styles.chartNameDark : styles.chartNameLight]}>
                        {card.name}: {percentSaved.toFixed(0)}% ahorrado / {percentPending.toFixed(0)}% pendiente
                      </Text>
                    </View>
                  );
                })}
              </>
            )}

            <Text style={[styles.panelTitle, styles.innerTitle, isDarkMode ? styles.panelTitleDark : styles.panelTitleLight]}>
              Velas históricas
            </Text>
            <Text style={[styles.panelSubTitle, isDarkMode ? styles.panelSubTitleDark : styles.panelSubTitleLight]}>
              Desde que comenzaste. Vista diaria con eje horizontal por días y eje vertical de referencia 1-100.
            </Text>
            <View style={styles.zoomButtonsRow}>
              <View style={[styles.zoomButton, styles.zoomButtonActive]}>
                <Text style={[styles.zoomButtonText, styles.zoomButtonTextActive]}>Temporalidad diaria</Text>
              </View>
            </View>
            <View style={[styles.candleChartFrame, styles.candleChartFrameDark]}>
              <View style={styles.candleScaleHeader}>
                <Text style={[styles.candleScaleLabel, styles.candleScaleLabelLight]}>
                  Máx: {formatCurrency(candlesBounds.max, selectedCurrency)}
                </Text>
                <Text style={[styles.candleScaleLabel, styles.candleScaleLabelLight]}>
                  Mín: {formatCurrency(candlesBounds.min, selectedCurrency)}
                </Text>
              </View>
              <View style={styles.candleGrid}>
                {[0, 1, 2, 3].map((line) => (
                  <View
                    key={`grid-${line}`}
                    style={[
                      styles.candleGridLine,
                      { top: `${(line / 3) * 100}%` },
                      styles.candleGridLineDark,
                    ]}
                  />
                ))}
              </View>
              <View style={styles.rightAxisLine} />
              <View style={styles.rightAxisLabels}>
                {[100, 75, 50, 25, 1].map((axisValue) => (
                  <Text key={`axis-${axisValue}`} style={styles.rightAxisLabelText}>{axisValue}</Text>
                ))}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.candleRow}>
                {candles.map((period) => {
                  const wickHeight = Math.max(14, ((period.high - period.low) / candlesScale) * 126);
                  const bodyHeight = Math.max(8, (Math.abs(period.close - period.open) / candlesScale) * 92);
                  const isUp = period.close >= period.open;
                  const dayLabel = period.periodStart.toLocaleDateString('es-CO', { day: '2-digit' });

                  return (
                    <View key={period.id} style={styles.candleItem}>
                      <View style={[styles.candleWick, { height: wickHeight }, styles.candleWickDark]} />
                      <View style={[
                        styles.candleBody,
                        isUp ? styles.candleBodyUp : styles.candleBodyDown,
                        {
                          height: bodyHeight,
                        },
                      ]}
                      />
                      <Text style={[styles.candleLabel, styles.candleScaleLabelLight]}>{dayLabel}</Text>
                    </View>
                  );
                })}
              </ScrollView>
              <View style={[styles.timeAxisLine, styles.timeAxisLineDark]} />
            </View>

            <Pressable onPress={handleDownloadChartExcel} style={[styles.snapshotButton, styles.snapshotButtonSecondary]}>
              <Text style={styles.snapshotButtonSecondaryText}>Descargar como Excel</Text>
            </Pressable>
            {!!snapshotMessage && (
              <Text style={[styles.snapshotMessage, isDarkMode ? styles.panelSubTitleDark : styles.panelSubTitleLight]}>
                {snapshotMessage}
              </Text>
            )}

            <Text style={[styles.panelTitle, styles.innerTitle, isDarkMode ? styles.panelTitleDark : styles.panelTitleLight]}>
              Balance mensual de movimientos
            </Text>
            <View style={styles.chartRow}>
              <View style={styles.chartHeader}>
                <Text style={[styles.chartName, isDarkMode ? styles.chartNameDark : styles.chartNameLight]}>Aporte neto</Text>
                <Text style={styles.chartAmount}>{formatCurrency(flowTotals.invested, selectedCurrency)}</Text>
              </View>
              <View style={styles.chartTrack}>
                <View
                  style={[
                    styles.chartFill,
                    {
                      width: `${flowTotals.invested > 0 ? 100 : 0}%`,
                      backgroundColor: '#FFFFFF',
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.chartRow}>
              <View style={styles.chartHeader}>
                <Text style={[styles.chartName, isDarkMode ? styles.chartNameDark : styles.chartNameLight]}>Retiro neto</Text>
                <Text style={styles.chartAmount}>{formatCurrency(flowTotals.withdrawn, selectedCurrency)}</Text>
              </View>
              <View style={styles.chartTrack}>
                <View
                  style={[
                    styles.chartFill,
                    {
                      width: `${flowTotals.withdrawn > 0 ? 100 : 0}%`,
                      backgroundColor: '#FFFFFF',
                    },
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.panelSubTitle, isDarkMode ? styles.panelSubTitleDark : styles.panelSubTitleLight]}>
              Este indicador muestra el balance neto del mes para evitar acumulaciones engañosas.
            </Text>

            <View style={[styles.coachingCard, isDarkMode ? styles.coachingCardDark : styles.coachingCardLight]}>
              <Text style={[styles.coachingTitle, isDarkMode ? styles.emotionalTitleDark : styles.emotionalTitleLight]}>
                Micro coaching diario
              </Text>
              <Text style={[styles.coachingTip, isDarkMode ? styles.panelSubTitleDark : styles.panelSubTitleLight]}>
                {dailyTip}
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'perfil' && (
          <View style={[styles.panel, isDarkMode ? styles.panelDark : styles.panelLight]}>
            <Text style={[styles.panelTitle, isDarkMode ? styles.panelTitleDark : styles.panelTitleLight]}>Tu zona financiera 💼</Text>
            <View style={styles.profileGrid}>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Puntos</Text>
                <Text style={styles.profileValue}>{pointsLabel}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Destinado a ahorrar</Text>
                <Text style={styles.profileValue}>{formatCurrency(plannedInvestment, selectedCurrency)}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Ahorrado real</Text>
                <Text style={styles.profileValue}>{formatCurrency(totalInvestedThisMonth + bonusAvailable, selectedCurrency)}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>¿Desde cuándo empezaste?</Text>
                <Text style={styles.profileValue}>{startedLabel}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Si mantienes este ritmo mensual</Text>
                <Text style={styles.profileValue}>{formatCurrency(annualProjection, selectedCurrency)} al año</Text>
              </View>
            </View>
            <Text style={[styles.profileHint, isDarkMode ? styles.panelSubTitleDark : styles.panelSubTitleLight]}>
              El “destinado a ahorrar” es tu meta subjetiva del mes y se redefine en cada nuevo mes.
            </Text>
            <Pressable onPress={() => setIsSummaryVisible(true)} style={styles.profileButton}>
              <Text style={styles.profileButtonText}>Editar datos del usuario</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomNav, isDarkMode ? styles.bottomNavDark : styles.bottomNavLight]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.navButton, isActive && styles.navButtonActive]}
            >
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
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
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  safeAreaDark: { backgroundColor: '#000000' },
  safeAreaLight: { backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  cardList: { gap: 16, marginBottom: 24 },
  emptyText: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyTextDark: { borderColor: '#FFFFFF', color: '#FFFFFF', backgroundColor: '#000000' },
  emptyTextLight: { borderColor: '#000000', color: '#000000', backgroundColor: '#FFFFFF' },
  panel: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  panelDark: { backgroundColor: '#000000', borderColor: '#FFFFFF' },
  panelLight: { backgroundColor: '#FFFFFF', borderColor: '#000000' },
  panelTitle: { fontSize: 20, fontWeight: '800' },
  panelTitleDark: { color: '#F8F6F0' },
  panelTitleLight: { color: '#111111' },
  panelSubTitle: { marginTop: 8, marginBottom: 16, fontSize: 13 },
  panelSubTitleDark: { color: '#FFFFFF' },
  panelSubTitleLight: { color: '#000000' },
  innerTitle: { marginTop: 20, marginBottom: 8, fontSize: 16 },
  chartRow: { marginBottom: 14 },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  chartName: { fontWeight: '700' },
  chartNameDark: { color: '#E5E7EB' },
  chartNameLight: { color: '#111111' },
  chartPercent: { color: '#000000', fontWeight: '800' },
  chartPercentDark: { color: '#FFFFFF' },
  chartTrack: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D4D4D4',
  },
  chartFill: { height: '100%', borderRadius: 999 },
  plannedFill: { backgroundColor: '#FFFFFF' },
  actualFill: { backgroundColor: '#FFFFFF' },
  chartAmount: { color: '#000000', fontSize: 12, fontWeight: '700' },
  pieRow: { marginTop: 10 },
  pieTrack: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  pieFill: { height: '100%' },
  pieFillSecondary: { height: '100%', backgroundColor: '#D4D4D4' },
  pieLabel: { marginTop: 6, fontSize: 12, fontWeight: '700' },
  zoomButtonsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  zoomButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  zoomButtonActive: { backgroundColor: '#111111', borderColor: '#111111' },
  zoomButtonText: { fontSize: 12, fontWeight: '700', color: '#111111' },
  zoomButtonTextActive: { color: '#FFFFFF' },
  candleRow: {
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 170,
    paddingRight: 56,
  },
  candleChartFrame: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#2B2B2B',
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  candleChartFrameDark: { backgroundColor: '#101010' },
  candleChartFrameLight: { backgroundColor: '#101010' },
  candleScaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    zIndex: 2,
  },
  candleScaleLabel: { fontSize: 11, fontWeight: '700' },
  candleScaleLabelLight: { color: '#FFFFFF' },
  candleGrid: {
    ...StyleSheet.absoluteFillObject,
    top: 30,
    left: 0,
    right: 0,
    bottom: 30,
  },
  candleGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  candleGridLineDark: { borderTopColor: '#1F2A44' },
  candleGridLineLight: { borderTopColor: '#3A3A3A' },
  rightAxisLine: {
    position: 'absolute',
    right: 40,
    top: 36,
    bottom: 30,
    borderRightWidth: 1,
    borderRightColor: '#4B5563',
  },
  rightAxisLabels: {
    position: 'absolute',
    right: 8,
    top: 30,
    bottom: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rightAxisLabelText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  candleItem: { alignItems: 'center', width: 42, marginRight: 6 },
  candleWick: { width: 2, backgroundColor: '#6B7280', borderRadius: 999 },
  candleWickDark: { backgroundColor: '#94A3B8' },
  candleBody: { width: 16, marginTop: -4, borderRadius: 1, borderWidth: 1 },
  candleBodyUp: { backgroundColor: '#22C55E', borderColor: '#15803D' },
  candleBodyDown: { backgroundColor: '#EF4444', borderColor: '#B91C1C' },
  candleLabel: { marginTop: 8, fontSize: 11, fontWeight: '700' },
  timeAxisLine: {
    position: 'absolute',
    left: 0,
    right: 40,
    bottom: 30,
    borderTopWidth: 1,
  },
  timeAxisLineDark: { borderTopColor: '#525252' },
  timeAxisLineLight: { borderTopColor: '#525252' },
  snapshotButton: {
    borderRadius: 3,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snapshotButtonSecondary: { backgroundColor: '#111827', borderColor: '#1F2937', marginBottom: 4 },
  snapshotButtonSecondaryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  snapshotMessage: { marginTop: 8, marginBottom: 4, fontSize: 12, fontWeight: '700' },
  profileGrid: { marginTop: 12, gap: 10 },
  profileItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#000000',
  },
  profileLabel: { color: '#000000', fontSize: 12 },
  profileValue: { marginTop: 4, color: '#111111', fontSize: 16, fontWeight: '700' },
  profileHint: { marginTop: 10, fontSize: 12, fontWeight: '600' },
  profileButton: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center',
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.38,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  profileButtonText: { color: '#FFFFFF', fontWeight: '800' },
  overflowNotice: {
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  overflowNoticeDark: { backgroundColor: '#1F1F1F', borderColor: '#FFFFFF' },
  overflowNoticeLight: { backgroundColor: '#FFFFFF', borderColor: '#000000' },
  overflowNoticeText: { fontSize: 13, fontWeight: '700' },
  overflowNoticeTextDark: { color: '#FFFFFF' },
  overflowNoticeTextLight: { color: '#000000' },
  withdrawBonusButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  withdrawBonusButtonDark: { backgroundColor: '#7F1D1D', borderColor: '#991B1B' },
  withdrawBonusButtonLight: { backgroundColor: '#000000', borderColor: '#000000' },
  withdrawBonusButtonText: { fontWeight: '700', fontSize: 12 },
  withdrawBonusButtonTextDark: { color: '#FEE2E2' },
  withdrawBonusButtonTextLight: { color: '#FFFFFF' },
  bottomNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  bottomNavDark: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  bottomNavLight: { backgroundColor: '#FFFFFF', borderColor: '#000000' },
  navButton: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 14 },
  navButtonActive: { backgroundColor: '#000000' },
  navLabel: { color: '#000000', fontSize: 12, fontWeight: '700' },
  navLabelActive: { color: '#FFFFFF' },

  onboardingCard: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  onboardingCardDark: { backgroundColor: '#000000', borderColor: '#FFFFFF' },
  onboardingCardLight: { backgroundColor: '#FFFFFF', borderColor: '#000000' },
  onboardingTitle: { fontSize: 24, fontWeight: '800' },
  onboardingTitleDark: { color: '#F8F6F0' },
  onboardingTitleLight: { color: '#111111' },
  onboardingSubtitle: { marginTop: 8, marginBottom: 18, fontSize: 14 },
  onboardingSubtitleDark: { color: '#FFFFFF' },
  onboardingSubtitleLight: { color: '#000000' },
  landingScrollContent: { paddingVertical: 20 },
  landingQuestionBlock: { marginBottom: 8 },
  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  inputLabelDark: { color: '#FFFFFF' },
  inputLabelLight: { color: '#000000' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputDark: { borderColor: '#FFFFFF', color: '#F9FAFB', backgroundColor: '#111111' },
  inputLight: { borderColor: '#000000', color: '#000000', backgroundColor: '#FFFFFF' },
  helperText: { marginTop: 8, fontSize: 11, fontWeight: '600' },
  helperTextDark: { color: '#FFFFFF' },
  helperTextLight: { color: '#404040' },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700' },
  secondaryThemeButton: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryThemeButtonText: { color: '#000000', fontWeight: '700' },
  secondaryThemeButtonTextDark: { color: '#FFFFFF' },
  currencyRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  granularityRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  currencyButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  currencyButtonActive: { backgroundColor: '#000000', borderColor: '#000000' },
  currencyButtonText: { color: '#000000', fontWeight: '700' },
  currencyButtonTextActive: { color: '#FFFFFF' },
  emotionalTitle: { fontSize: 18, fontWeight: '800' },
  emotionalTitleDark: { color: '#FFFFFF' },
  emotionalTitleLight: { color: '#111111' },
  moodOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodOption: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  moodOptionDark: { borderColor: '#FFFFFF', backgroundColor: '#1F1F1F' },
  moodOptionLight: { borderColor: '#000000', backgroundColor: '#FFFFFF' },
  moodOptionActive: { backgroundColor: '#000000', borderColor: '#000000' },
  moodOptionText: { color: '#000000', fontSize: 12, fontWeight: '700' },
  moodOptionTextDark: { color: '#FFFFFF' },
  moodOptionTextActive: { color: '#FFFFFF' },
  coachingCard: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  coachingCardDark: { backgroundColor: '#111111', borderColor: '#FFFFFF' },
  coachingCardLight: { backgroundColor: '#FFFFFF', borderColor: '#000000' },
  coachingTitle: { fontSize: 16, fontWeight: '800' },
  coachingTip: { marginTop: 8, fontSize: 13, fontWeight: '700' },
  coachingRecommendation: { marginTop: 6, fontSize: 13 },
});
