import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';

import CreateCardModal from './components/CreateCardModal';
import Header from './components/Header';
import HistoryCard from './components/HistoryCard';
import SavingsCard from './components/SavingsCard';
import SectionHeader from './components/SectionHeader';
import SummaryCard from './components/SummaryCard';
import UserSummaryModal from './components/UserSummaryModal';
import savingsCards from './data/savingsCards';
import { clampPercentage, formatCurrency } from './utils/formatters';

const tabs = [
  { key: 'inicio', label: 'Inicio 🏠' },
  { key: 'graficos', label: 'Gráficos 📊' },
  { key: 'perfil', label: 'Perfil 👤' },
];

export default function App() {
  const [cards, setCards] = useState(savingsCards);
  const [userName, setUserName] = useState('');
  const [plannedInvestment, setPlannedInvestment] = useState(0);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isCreateCardVisible, setIsCreateCardVisible] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [bonusAvailable, setBonusAvailable] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const [isOnboardingDone, setIsOnboardingDone] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftPlannedInvestment, setDraftPlannedInvestment] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('COP');
  const [transactions, setTransactions] = useState([]);

  const pointsPerBlock = 50;
  const currencyBlockValue = selectedCurrency === 'USD' ? 100 : 100000;
  const currentMonthKey = useMemo(() => new Date().toISOString().slice(0, 7), []);

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

  const handleCompleteOnboarding = () => {
    const parsedInvestment = Number(draftPlannedInvestment);

    if (!draftName.trim() || Number.isNaN(parsedInvestment) || parsedInvestment < 0) {
      return;
    }

    setUserName(draftName.trim());
    setPlannedInvestment(parsedInvestment);
    setIsOnboardingDone(true);
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

  if (!isOnboardingDone) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode ? styles.safeAreaDark : styles.safeAreaLight]}>
        <View style={[styles.onboardingCard, isDarkMode ? styles.onboardingCardDark : styles.onboardingCardLight]}>
          <Text style={[styles.onboardingTitle, isDarkMode ? styles.onboardingTitleDark : styles.onboardingTitleLight]}>
            Configuremos tu mes ✨
          </Text>
          <Text style={[styles.onboardingSubtitle, isDarkMode ? styles.onboardingSubtitleDark : styles.onboardingSubtitleLight]}>
            Dinos tu nombre, tu moneda y cuánto crees que vas a invertir este mes.
          </Text>

          <Text style={[styles.inputLabel, isDarkMode ? styles.inputLabelDark : styles.inputLabelLight]}>Tu nombre</Text>
          <TextInput
            value={draftName}
            onChangeText={setDraftName}
            style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
            placeholder="Escribe tu nombre"
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
          />

          <Text style={[styles.inputLabel, isDarkMode ? styles.inputLabelDark : styles.inputLabelLight]}>
            Destinado a invertir
          </Text>
          <TextInput
            value={draftPlannedInvestment}
            onChangeText={setDraftPlannedInvestment}
            keyboardType="numeric"
            style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
            placeholder="0"
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
          />

          <Text style={[styles.inputLabel, isDarkMode ? styles.inputLabelDark : styles.inputLabelLight]}>Moneda base</Text>
          <View style={styles.currencyRow}>
            {[
              { code: 'COP', label: 'Pesos' },
              { code: 'USD', label: 'Dólares' },
            ].map((option) => {
              const isActive = selectedCurrency === option.code;
              return (
                <Pressable
                  key={option.code}
                  onPress={() => setSelectedCurrency(option.code)}
                  style={[styles.currencyButton, isActive && styles.currencyButtonActive]}
                >
                  <Text style={[styles.currencyButtonText, isActive && styles.currencyButtonTextActive]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={handleCompleteOnboarding} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Empezar</Text>
          </Pressable>
          <Pressable onPress={() => setIsDarkMode((prev) => !prev)} style={styles.secondaryThemeButton}>
            <Text style={styles.secondaryThemeButtonText}>{isDarkMode ? 'Modo claro' : 'Modo oscuro'}</Text>
          </Pressable>
        </View>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
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
        />

        {activeTab === 'inicio' && (
          <>
            <SummaryCard
              plannedInvestment={plannedInvestment}
              actualInvestment={totalInvestedThisMonth}
              isDarkMode={isDarkMode}
              currencyCode={selectedCurrency}
            />
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
            Destinado a invertir vs invertido real (reinicio mensual).
            </Text>

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
                <Text style={[styles.chartName, isDarkMode ? styles.chartNameDark : styles.chartNameLight]}>Invertido real</Text>
                <Text style={styles.chartAmount}>{formatCurrency(totalInvestedThisMonth, selectedCurrency)}</Text>
              </View>
              <View style={styles.chartTrack}>
                <View style={[styles.chartFill, styles.actualFill, { width: `${plannedVsActualPercent}%` }]} />
              </View>
            </View>

            <Text style={styles.chartPercent}>{plannedVsActualPercent.toFixed(0)}% del objetivo mensual</Text>

            {chartData.length > 0 && (
              <>
                <Text style={[styles.panelTitle, styles.innerTitle, isDarkMode ? styles.panelTitleDark : styles.panelTitleLight]}>
                  Avance por tarjeta
                </Text>
                {chartData.map((item) => (
                  <View key={item.id} style={styles.chartRow}>
                    <View style={styles.chartHeader}>
                      <Text style={[styles.chartName, isDarkMode ? styles.chartNameDark : styles.chartNameLight]}>{item.name}</Text>
                      <Text style={styles.chartPercent}>{item.percent.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.chartTrack}>
                      <View style={[styles.chartFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
                    </View>
                  </View>
                ))}
              </>
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
                      backgroundColor: '#0284C7',
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
                      backgroundColor: '#6366F1',
                    },
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.panelSubTitle, isDarkMode ? styles.panelSubTitleDark : styles.panelSubTitleLight]}>
              Este indicador muestra el balance neto del mes para evitar acumulaciones engañosas.
            </Text>
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
                <Text style={styles.profileLabel}>Destinado a invertir</Text>
                <Text style={styles.profileValue}>{formatCurrency(plannedInvestment, selectedCurrency)}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Invertido real</Text>
                <Text style={styles.profileValue}>{formatCurrency(totalInvestedThisMonth + bonusAvailable, selectedCurrency)}</Text>
              </View>
            </View>
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
  safeAreaDark: { backgroundColor: '#020617' },
  safeAreaLight: { backgroundColor: '#F1F5F9' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  cardList: { gap: 16, marginBottom: 24 },
  emptyText: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyTextDark: { borderColor: '#1E3A8A', color: '#93C5FD', backgroundColor: '#0B1220' },
  emptyTextLight: { borderColor: '#BFDBFE', color: '#1E3A8A', backgroundColor: '#EFF6FF' },
  panel: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#020617',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  panelDark: { backgroundColor: '#0B1220', borderColor: '#1E3A8A' },
  panelLight: { backgroundColor: '#FFFFFF', borderColor: '#BFDBFE' },
  panelTitle: { fontSize: 20, fontWeight: '800' },
  panelTitleDark: { color: '#F8FAFC' },
  panelTitleLight: { color: '#0F172A' },
  panelSubTitle: { marginTop: 8, marginBottom: 16, fontSize: 13 },
  panelSubTitleDark: { color: '#93C5FD' },
  panelSubTitleLight: { color: '#1E3A8A' },
  innerTitle: { marginTop: 20, marginBottom: 8, fontSize: 16 },
  chartRow: { marginBottom: 14 },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  chartName: { fontWeight: '700' },
  chartNameDark: { color: '#E2E8F0' },
  chartNameLight: { color: '#0F172A' },
  chartPercent: { color: '#2563EB', fontWeight: '800' },
  chartTrack: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chartFill: { height: '100%', borderRadius: 999 },
  plannedFill: { backgroundColor: '#1D4ED8' },
  actualFill: { backgroundColor: '#38BDF8' },
  chartAmount: { color: '#1E3A8A', fontSize: 12, fontWeight: '700' },
  profileGrid: { marginTop: 12, gap: 10 },
  profileItem: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  profileLabel: { color: '#1D4ED8', fontSize: 12 },
  profileValue: { marginTop: 4, color: '#0F172A', fontSize: 16, fontWeight: '700' },
  profileButton: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    paddingVertical: 12,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.38,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  profileButtonText: { color: '#FFFFFF', fontWeight: '800' },
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
    shadowColor: '#020617',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  bottomNavDark: { backgroundColor: '#0B1220', borderColor: '#1E3A8A' },
  bottomNavLight: { backgroundColor: '#FFFFFF', borderColor: '#BFDBFE' },
  navButton: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 14 },
  navButtonActive: { backgroundColor: '#1D4ED8' },
  navLabel: { color: '#1E3A8A', fontSize: 12, fontWeight: '700' },
  navLabelActive: { color: '#FFFFFF' },

  onboardingCard: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#020617',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  onboardingCardDark: { backgroundColor: '#0B1220', borderColor: '#1E3A8A' },
  onboardingCardLight: { backgroundColor: '#FFFFFF', borderColor: '#BFDBFE' },
  onboardingTitle: { fontSize: 24, fontWeight: '800' },
  onboardingTitleDark: { color: '#F8FAFC' },
  onboardingTitleLight: { color: '#0F172A' },
  onboardingSubtitle: { marginTop: 8, marginBottom: 18, fontSize: 14 },
  onboardingSubtitleDark: { color: '#93C5FD' },
  onboardingSubtitleLight: { color: '#1E3A8A' },
  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  inputLabelDark: { color: '#BFDBFE' },
  inputLabelLight: { color: '#1E3A8A' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputDark: { borderColor: '#1E3A8A', color: '#F9FAFB', backgroundColor: '#0F172A' },
  inputLight: { borderColor: '#CBD5E1', color: '#111827', backgroundColor: '#F8FAFC' },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#2563EB',
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
  secondaryThemeButtonText: { color: '#2563EB', fontWeight: '700' },
  currencyRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  currencyButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  currencyButtonActive: { backgroundColor: '#2563EB', borderColor: '#1D4ED8' },
  currencyButtonText: { color: '#1E3A8A', fontWeight: '700' },
  currencyButtonTextActive: { color: '#FFFFFF' },
});
