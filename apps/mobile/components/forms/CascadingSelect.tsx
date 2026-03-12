import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/theme';

interface Option {
  id: string;
  name: string;
  [key: string]: any;
}

interface CascadingSelectProps {
  label: string;
  options: Option[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  placeholder?: string;
}

export function CascadingSelect({
  label,
  options,
  selectedId,
  onSelect,
  isLoading = false,
  disabled = false,
  searchable = false,
  placeholder = 'Select...',
}: CascadingSelectProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = options.find((o) => o.id === selectedId);
  const filtered = searchable && search
    ? options.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.trigger, disabled && styles.disabled]}
        onPress={() => !disabled && setExpanded(!expanded)}
      >
        <Text style={[styles.triggerText, !selectedOption && styles.placeholder]}>
          {selectedOption?.name ?? placeholder}
        </Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded && (
        <View style={[styles.dropdown, shadows.md]}>
          {searchable && (
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          )}
          {isLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : filtered.length === 0 ? (
            <Text style={styles.loadingText}>No options found</Text>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.option,
                    item.id === selectedId && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.id);
                    setExpanded(false);
                    setSearch('');
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.id === selectedId && styles.optionTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  disabled: { opacity: 0.5 },
  triggerText: { ...typography.body, color: colors.text, flex: 1 },
  placeholder: { color: colors.textTertiary },
  chevron: { ...typography.caption, color: colors.textTertiary, marginLeft: spacing.sm },
  dropdown: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    maxHeight: 250,
    overflow: 'hidden',
  },
  searchInput: {
    ...typography.body,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  list: { maxHeight: 200 },
  option: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  optionSelected: { backgroundColor: colors.primary + '10' },
  optionText: { ...typography.body, color: colors.text },
  optionTextSelected: { color: colors.primary, fontWeight: '600' },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    padding: spacing.lg,
    textAlign: 'center',
  },
});
