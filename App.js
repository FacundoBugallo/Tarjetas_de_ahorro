import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import Header from './components/Header';
import HistoryCard from './components/HistoryCard';
import SavingsCard from './components/SavingsCard';
import SectionHeader from './components/SectionHeader';
import SummaryCard from './components/SummaryCard';
import savingsCards from './data/savingsCards';

export default function App() {
  const totalTargetMonthly = savingsCards.reduce(
    (sum, card) => sum + card.nextContribution,
    0,
  );
  const monthlyIncome = 4200;
  const availableMonthly = Math.max(monthlyIncome - totalTargetMonthly, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />
        <SummaryCard availableMonthly={availableMonthly} />
        <SectionHeader />

        <View style={styles.cardList}>
          {savingsCards.map((card) => (
            <SavingsCard key={card.id} card={card} />
          ))}
        </View>

        <HistoryCard />
      </ScrollView>
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
