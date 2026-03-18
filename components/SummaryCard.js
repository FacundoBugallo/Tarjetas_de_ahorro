import { StyleSheet, View } from 'react-native';
import Card from './ui/Card';
import StatBox from './ui/StatBox';
import { formatCurrency } from '../utils/formatters';
import spacing from '../theme/spacing.ts';

export default function SummaryCard({ plannedInvestment, actualInvestment, currencyCode }) {
  const remaining = Math.max(plannedInvestment - actualInvestment, 0);

  return (
    <Card>
      <View style={styles.row}>
        <StatBox label="Destinado" value={formatCurrency(plannedInvestment, currencyCode)} />
        <StatBox label="Ahorrado" value={formatCurrency(actualInvestment, currencyCode)} />
        <StatBox label="Restante" value={formatCurrency(remaining, currencyCode)} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
});
