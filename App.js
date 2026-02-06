import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import CreateCardModal from './components/CreateCardModal';
import Header from './components/Header';
import HistoryCard from './components/HistoryCard';
import SavingsCard from './components/SavingsCard';
import SectionHeader from './components/SectionHeader';
import SummaryCard from './components/SummaryCard';
import UserSummaryModal from './components/UserSummaryModal';
import savingsCards from './data/savingsCards';

export default function App() {
  const [cards, setCards] = useState(savingsCards);
  const [userName, setUserName] = useState('Camila');
  const [levelLabel, setLevelLabel] = useState('Nivel 4 · Estratega constante');
  const [pointsLabel] = useState('+120 pts');
  const [incomeStatus, setIncomeStatus] = useState('Estable');
  const [monthlyIncome, setMonthlyIncome] = useState(4200);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isCreateCardVisible, setIsCreateCardVisible] = useState(false);
  const totalTargetMonthly = cards.reduce(
    (sum, card) => sum + card.nextContribution,
    0,
  );
  const availableMonthly = Math.max(monthlyIncome - totalTargetMonthly, 0);

  const handleAddContribution = (cardId) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              savedAmount: card.savedAmount + card.nextContribution,
            }
          : card,
      ),
    );
  };

  const handleAddCard = (newCard) => {
    setCards((prevCards) => [...prevCards, newCard]);
    setIsCreateCardVisible(false);
  };

  const handleSaveUser = (updatedUser) => {
    setUserName(updatedUser.userName);
    setLevelLabel(updatedUser.levelLabel);
    setIncomeStatus(updatedUser.incomeStatus);
    setMonthlyIncome(updatedUser.monthlyIncome);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header
          onPress={() => setIsSummaryVisible(true)}
          userName={userName}
          levelLabel={levelLabel}
          pointsLabel={pointsLabel}
        />
        <SummaryCard
          availableMonthly={availableMonthly}
          incomeStatus={incomeStatus}
        />
        <SectionHeader onCreate={() => setIsCreateCardVisible(true)} />

        <View style={styles.cardList}>
          {cards.map((card) => (
            <SavingsCard
              key={card.id}
              card={card}
              onAddContribution={handleAddContribution}
            />
          ))}
        </View>

        <HistoryCard />
      </ScrollView>
      <UserSummaryModal
        visible={isSummaryVisible}
        onClose={() => setIsSummaryVisible(false)}
        userName={userName}
        levelLabel={levelLabel}
        incomeStatus={incomeStatus}
        monthlyIncome={monthlyIncome}
        availableMonthly={availableMonthly}
        onSave={handleSaveUser}
      />
      <CreateCardModal
        visible={isCreateCardVisible}
        onClose={() => setIsCreateCardVisible(false)}
        onSubmit={handleAddCard}
        index={cards.length}
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  cardList: {
    gap: 16,
    marginBottom: 24,
  },
});
