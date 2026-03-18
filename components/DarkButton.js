import Button from './ui/Button';

export default function DarkButton({
  label,
  onPress,
  style,
  textStyle,
  disabled = false,
  accessibilityLabel,
}) {
  return (
    <Button
      label={label}
      onPress={onPress}
      style={style}
      textStyle={textStyle}
      disabled={disabled}
      variant="secondary"
      accessibilityLabel={accessibilityLabel || label}
    />
  );
}
