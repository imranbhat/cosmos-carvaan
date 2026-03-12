import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

interface ChatInputProps {
  onSend: (text: string) => void;
  onAttachImage?: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, onAttachImage, disabled = false }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View style={styles.container}>
      {onAttachImage && (
        <Pressable style={styles.attachBtn} onPress={onAttachImage}>
          <SymbolView
            name={{ ios: 'photo' as any, android: 'photo', web: 'photo' }}
            tintColor={colors.textTertiary}
            size={22}
          />
        </Pressable>
      )}

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor={colors.textTertiary}
        multiline
        maxLength={2000}
        editable={!disabled}
      />

      <Pressable
        style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || disabled}
      >
        <SymbolView
          name={{ ios: 'arrow.up.circle.fill' as any, android: 'send', web: 'send' }}
          tintColor={text.trim() ? colors.primary : colors.textTertiary}
          size={30}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.sm,
  },
  attachBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  input: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    minHeight: 36,
  },
  sendBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: { opacity: 0.5 },
});
