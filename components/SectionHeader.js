import { StyleSheet, Text, View } from 'react-native';
import DarkButton from './DarkButton';
import palette from '../theme/colors';

export default function SectionHeader({ title, actionLabel, onActionPress, isDarkMode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, isDarkMode ? styles.sectionTitleDark : styles.sectionTitleLight]}>{title}</Text>
      {onActionPress ? (
        <DarkButton
          onPress={onActionPress}
          label={actionLabel}
          style={styles.createButtonWrapper}
          gradientStyle={styles.createButton}
          textStyle={styles.createButtonText}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: { fontSize: 22, fontWeight: '800' },
  sectionTitleDark: { color: palette.white },
  sectionTitleLight: { color: palette.black },
  createButtonWrapper: { minWidth: 130 },
  createButton: {
    width: '100%',
    height: 42,
    borderRadius: 999,
  },
  createButtonText: {
    fontWeight: '700',
    fontSize: 12,
  },
});
