import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

interface MessageBubbleProps {
  message: {
    id: string;
    sender_id: string;
    message_type: string;
    content: string;
    image_url?: string | null;
    created_at: string;
  };
  isOwn: boolean;
  showSender?: boolean;
}

export function MessageBubble({ message, isOwn, showSender = false }: MessageBubbleProps) {
  const [showTime, setShowTime] = useState(false);

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.row, isOwn && styles.rowOwn]}>
      <Pressable
        style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}
        onPress={() => setShowTime(!showTime)}
      >
        {message.message_type === 'image' && message.image_url ? (
          <Image
            source={{ uri: message.image_url }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : null}

        {message.content ? (
          <Text style={[styles.text, isOwn && styles.textOwn]}>
            {message.content}
          </Text>
        ) : null}

        {showTime && (
          <Text style={[styles.time, isOwn && styles.timeOwn]}>{time}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  rowOwn: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.borderLight,
    borderBottomLeftRadius: 4,
  },
  text: {
    ...typography.body,
    color: colors.text,
  },
  textOwn: {
    color: '#fff',
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  time: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
    fontSize: 10,
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.7)',
  },
});
