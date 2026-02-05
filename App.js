import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

const savingsCards = [
  {
    id: 'card-1',
    name: 'Viaje a Cartagena',
    targetAmount: 2800,
    savedAmount: 920,
    cadence: 'Semanal',
    nextContribution: 120,
    color: '#FFE9D2',
  },
  {
    id: 'card-2',
    name: 'Laptop nueva',
    targetAmount: 1800,
    savedAmount: 540,
    cadence: 'Mensual',
    nextContribution: 150,
    color: '#E2F4FF',
  },
  {
    id: 'card-3',
    name: 'Curso de diseño',
    targetAmount: 600,
    savedAmount: 255,
    cadence: 'Diaria',
    nextContribution: 25,
    color: '#EFE6FF',
  },
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
};

const clampPercentage = (value) => Math.min(100, Math.max(0, value));

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
        <View style={styles.header}> 
          <View>
            <Text style={styles.greeting}>Hola, Camila</Text>
            <Text style={styles.level}>Nivel 4 · Estratega constante</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>+120 pts</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Nivel de ingresos</Text>
            <Text style={styles.summaryValue}>Estable</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View>
            <Text style={styles.summaryLabel}>Disponible por mes</Text>
            <Text style={styles.summaryValue}>{formatCurrency(availableMonthly)}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tus tarjetas de ahorro</Text>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>Crear tarjeta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardList}>
          {savingsCards.map((card) => {
            const percentage = clampPercentage(
              (card.savedAmount / card.targetAmount) * 100,
            );

            return (
              <View key={card.id} style={[styles.card, { backgroundColor: card.color }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{card.name}</Text>
                  <Text style={styles.cardTarget}>
                    Meta: {formatCurrency(card.targetAmount)}
                  </Text>
                </View>

                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardLabel}>Ahorro acumulado</Text>
                    <Text style={styles.cardValue}>{formatCurrency(card.savedAmount)}</Text>
                    <Text style={styles.cardCadence}>{card.cadence}</Text>
                  </View>
                  <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>
                      +{formatCurrency(card.nextContribution)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Historial de la semana</Text>
          <View style={styles.historyItem}>
            <Text style={styles.historyLabel}>Lunes</Text>
            <Text style={styles.historyValue}>2/3 tarjetas aportaron</Text>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyLabel}>Martes</Text>
            <Text style={styles.historyValue}>Alerta: faltó 1 aporte</Text>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyLabel}>Miércoles</Text>
            <Text style={styles.historyValue}>+25 pts por ahorro anticipado</Text>
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  level: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  levelBadge: {
    backgroundColor: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  levelBadgeText: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  createButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  cardList: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    padding: 18,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  cardTarget: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#111827',
    borderRadius: 999,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  cardCadence: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  addButton: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  addButtonText: {
    color: '#F9FAFB',
    fontWeight: '600',
    fontSize: 13,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  historyValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
});
