import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
}

export function OtpInput({ length = 6, onComplete, error }: OtpInputProps) {
  const [code, setCode] = useState('');
  const inputRef = useRef<TextInput>(null);

  function handleChange(text: string) {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
    setCode(cleaned);
    if (cleaned.length === length) {
      onComplete(cleaned);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.boxRow} onPress={() => inputRef.current?.focus()}>
        {Array.from({ length }, (_, i) => (
          <View
            key={i}
            style={[
              styles.box,
              code.length === i ? styles.boxActive : null,
              error ? styles.boxError : null,
              code[i] ? styles.boxFilled : null,
            ]}
          >
            <Text style={styles.digit}>{code[i] ?? ''}</Text>
          </View>
        ))}
      </Pressable>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={code}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoFocus
        maxLength={length}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  boxRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  boxActive: {
    borderColor: colors.primary,
  },
  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  boxError: {
    borderColor: colors.error,
  },
  digit: {
    ...typography.h2,
    color: colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
});
