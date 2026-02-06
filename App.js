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
  const [points, setPoints] = useState(0);
  const [incomeStatus, setIncomeStatus] = useState('Estable');
  const [monthlyIncome, setMonthlyIncome] = useState(4200);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isCreateCardVisible, setIsCreateCardVisible] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [bonusAvailable, setBonusAvailable] = useState(0);
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

        <HistoryCard items={historyItems} />
      </ScrollView>
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
