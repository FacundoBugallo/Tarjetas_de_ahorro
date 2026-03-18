import { StyleSheet, Text, View } from 'react-native';
import Button from './ui/Button';
import Card from './ui/Card';
import ProgressBar from './ui/ProgressBar';
import Badge from './ui/Badge';
import { formatCurrency } from '../utils/formatters';
import colors from '../theme/colors.ts';
import spacing from '../theme/spacing.ts';
import typography from '../theme/typography.ts';

export default function DebtCard({ debt, onAddPayment, onRemovePayment, currencyCode }) {
  const remaining = Math.max(debt.totalToPay - debt.paidAmount, 0);
  const progress = debt.totalToPay > 0 ? (debt.paidAmount / debt.totalToPay) * 100 : 0;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{debt.name}</Text>
        <Badge label={debt.cadence} color={colors.warning} />
      </View>

      <Text style={styles.body}>Total: {formatCurrency(debt.totalToPay, currencyCode)}</Text>
      <Text style={styles.body}>Cuota por periodo: {formatCurrency(debt.paymentAmount, currencyCode)}</Text>
      <Text style={styles.body}>Pagado: {formatCurrency(debt.paidAmount, currencyCode)}</Text>
      <Text style={styles.body}>Pendiente: {formatCurrency(remaining, currencyCode)}</Text>

      <ProgressBar progress={progress} color={colors.warning} />

      <View style={styles.actions}>
        <Button
          label="Alejar monto"
          variant="secondary"
          onPress={() => onRemovePayment(debt.id)}
          style={styles.actionButton}
          accessibilityLabel={`Reducir pago en ${debt.name}`}
        />
        <Button
          label="Pagar periodo"
          onPress={() => onAddPayment(debt.id)}
          style={styles.actionButton}
          accessibilityLabel={`Pagar periodo de ${debt.name}`}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
  title: { ...typography.subtitle, color: colors.textPrimary, flex: 1 },
  body: { ...typography.body, color: colors.textSecondary },
  actions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  actionButton: { flex: 1 },
});
