import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  { key: 'inicio', label: 'Inicio', emoji: '🏠' },
  { key: 'graficos', label: 'Gráficos', emoji: '📊' },
  { key: 'perfil', label: 'Perfil', emoji: '👤' },
];

export default function App() {
  const [cards, setCards] = useState(savingsCards);
  const [userName, setUserName] = useState('Camila');
  const [points, setPoints] = useState(0);
  const [incomeStatus, setIncomeStatus] = useState('Ingresos fijo');
  const [monthlyIncome, setMonthlyIncome] = useState(4200);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isCreateCardVisible, setIsCreateCardVisible] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [bonusAvailable, setBonusAvailable] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');

  const totalTargetMonthly = cards.reduce(
    (sum, card) => sum + card.nextContribution,
    0,
  );
  const availableMonthly = Math.max(
    monthlyIncome - totalTargetMonthly + bonusAvailable,
    0,
  );
  const level = Math.floor(points / 100) + 1;
  const levelLabel = `Nivel ${level}`;
  const pointsLabel = `${points} pts`;

  const chartData = useMemo(
    () => cards.map((card) => ({ ...card, percent: clampPercentage((card.savedAmount / card.targetAmount) * 100) })),
    [cards],
  );

  const handleAddContribution = (cardId) => {
    setCards((prevCards) => {
      const nextCards = [];
      prevCards.forEach((card) => {
        if (card.id !== cardId) {
          nextCards.push(card);
          return;
        }

        const updatedAmount = card.savedAmount + card.nextContribution;
        if (updatedAmount >= card.targetAmount) {
          const overflow = updatedAmount - card.targetAmount;
          const earnedPoints = Math.round(card.targetAmount / 10);
          setPoints((prevPoints) => prevPoints + earnedPoints);
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

  const handleAddCard = (newCard) => {
    setCards((prevCards) => [...prevCards, newCard]);
    setIsCreateCardVisible(false);
  };

  const handleSaveUser = (updatedUser) => {
    setUserName(updatedUser.userName);
    setIncomeStatus(updatedUser.incomeStatus);
    setMonthlyIncome(updatedUser.monthlyIncome);
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.safeAreaDark]}>
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
              availableMonthly={availableMonthly}
              incomeStatus={incomeStatus}
              isDarkMode={isDarkMode}
            />
            <SectionHeader onCreate={() => setIsCreateCardVisible(true)} isDarkMode={isDarkMode} />

            <View style={styles.cardList}>
              {cards.map((card) => (
                <SavingsCard
                  key={card.id}
                  card={card}
                  onAddContribution={handleAddContribution}
                  isDarkMode={isDarkMode}
                />
              ))}
            </View>

            <HistoryCard items={historyItems} isDarkMode={isDarkMode} />
          </>
        )}

        {activeTab === 'graficos' && (
          <View style={[styles.panel, isDarkMode && styles.panelDark]}>
            <Text style={[styles.panelTitle, isDarkMode && styles.panelTitleDark]}>📊 Ritmo de ahorro</Text>
            <Text style={[styles.panelSubTitle, isDarkMode && styles.panelSubTitleDark]}>
              Sigue el avance de cada meta con un estilo más neón.
            </Text>
            {chartData.map((item) => (
              <View key={item.id} style={styles.chartRow}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartName}>🎯 {item.name}</Text>
                  <Text style={styles.chartPercent}>{item.percent.toFixed(0)}%</Text>
                </View>
                <View style={styles.chartTrack}>
                  <View style={[styles.chartFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
                </View>
                <Text style={styles.chartAmount}>
                  {formatCurrency(item.savedAmount)} / {formatCurrency(item.targetAmount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'perfil' && (
          <View style={[styles.panel, isDarkMode && styles.panelDark]}>
            <Text style={[styles.panelTitle, isDarkMode && styles.panelTitleDark]}>👤 Tu zona financiera</Text>
            <View style={styles.profileGrid}>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>🏅 Puntos</Text>
                <Text style={styles.profileValue}>{pointsLabel}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>💼 Ingreso</Text>
                <Text style={styles.profileValue}>{incomeStatus}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>💵 Disponible</Text>
                <Text style={styles.profileValue}>{formatCurrency(availableMonthly)}</Text>
              </View>
            </View>
            <Pressable onPress={() => setIsSummaryVisible(true)} style={styles.profileButton}>
              <Text style={styles.profileButtonText}>⚙️ Editar datos del usuario</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomNav, isDarkMode && styles.bottomNavDark]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.navButton, isActive && styles.navButtonActive]}
            >
              <Text style={styles.navEmoji}>{tab.emoji}</Text>
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
        incomeStatus={incomeStatus}
        monthlyIncome={monthlyIncome}
        availableMonthly={availableMonthly}
        onSave={handleSaveUser}
        isDarkMode={isDarkMode}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#030712',
  },
  safeAreaDark: {
    backgroundColor: '#020617',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  cardList: {
    gap: 16,
    marginBottom: 24,
  },
  panel: {
    backgroundColor: '#0B1120',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1D4ED8',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  panelDark: {
    backgroundColor: '#020617',
    borderColor: '#0EA5E9',
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  panelTitleDark: {
    color: '#F8FAFC',
  },
  panelSubTitle: {
    marginTop: 8,
    marginBottom: 16,
    color: '#A5F3FC',
    fontSize: 13,
  },
  panelSubTitleDark: {
    color: '#A5F3FC',
  },
  chartRow: {
    marginBottom: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  chartName: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  chartPercent: {
    color: '#F0ABFC',
    fontWeight: '800',
  },
  chartTrack: {
    height: 12,
    backgroundColor: '#1E293B',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartFill: {
    height: '100%',
    borderRadius: 999,
  },
  chartAmount: {
    marginTop: 4,
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  profileGrid: {
    marginTop: 12,
    gap: 10,
  },
  profileItem: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#22D3EE',
  },
  profileLabel: {
    color: '#67E8F9',
    fontSize: 12,
  },
  profileValue: {
    marginTop: 4,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  profileButton: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#D946EF',
    alignItems: 'center',
    paddingVertical: 12,
    shadowColor: '#D946EF',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },
  profileButtonText: {
    color: '#FDF4FF',
    fontWeight: '800',
  },
  bottomNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1D4ED8',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.38,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 9,
  },
  bottomNavDark: {
    backgroundColor: '#020617',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 14,
  },
  navButtonActive: {
    backgroundColor: '#1D4ED8',
  },
  navEmoji: {
    fontSize: 16,
  },
  navLabel: {
    marginTop: 4,
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  navLabelActive: {
    color: '#FFFFFF',
  },
});
