import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/layout/EmptyState';
import { ConversationCard } from '@/components/chat/ConversationCard';
import { useConversations } from '@/hooks/useConversations';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export default function InboxScreen() {
  const { data: conversations = [], isLoading, refetch, isRefetching } = useConversations();

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {conversations.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{conversations.length}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ConversationCard conversation={item as any} />}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing['5xl'] }}
          ListEmptyComponent={
            <EmptyState
              icon="bubble.left.and.bubble.right"
              title="No conversations yet"
              message="Start chatting with sellers by browsing car listings"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  title: { ...typography.h1, color: colors.text },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
