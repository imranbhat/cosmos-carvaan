import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search cars...',
  onFilterPress,
  autoFocus = false,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        tintColor={colors.textTertiary}
        size={20}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <SymbolView
            name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
            tintColor={colors.textTertiary}
            size={18}
          />
        </Pressable>
      )}
      {onFilterPress && (
        <Pressable onPress={onFilterPress} style={styles.filterBtn} hitSlop={8}>
          <SymbolView
            name={{ ios: 'line.3.horizontal.decrease', android: 'tune', web: 'tune' }}
            tintColor={colors.primary}
            size={20}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  filterBtn: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
    paddingLeft: spacing.sm,
  },
});
