import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import spacing from '../../theme/spacing.ts';
import colors from '../../theme/colors.ts';

export default function ScreenContainer({ children, style }) {
  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});
