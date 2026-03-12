import { create } from 'zustand';

interface ChatState {
  activeConversationId: string | null;
  unreadCounts: Record<string, number>;
  totalUnread: number;
  setActiveConversation: (id: string | null) => void;
  setUnreadCount: (conversationId: string, count: number) => void;
  incrementUnread: (conversationId: string) => void;
  clearUnread: (conversationId: string) => void;
  resetAll: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeConversationId: null,
  unreadCounts: {},
  totalUnread: 0,

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
    if (id) {
      // Clear unread when entering a conversation
      const counts = { ...get().unreadCounts };
      delete counts[id];
      const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
      set({ unreadCounts: counts, totalUnread: total });
    }
  },

  setUnreadCount: (conversationId, count) => {
    const counts = { ...get().unreadCounts, [conversationId]: count };
    const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
    set({ unreadCounts: counts, totalUnread: total });
  },

  incrementUnread: (conversationId) => {
    if (get().activeConversationId === conversationId) return;
    const current = get().unreadCounts[conversationId] ?? 0;
    const counts = { ...get().unreadCounts, [conversationId]: current + 1 };
    const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
    set({ unreadCounts: counts, totalUnread: total });
  },

  clearUnread: (conversationId) => {
    const counts = { ...get().unreadCounts };
    delete counts[conversationId];
    const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
    set({ unreadCounts: counts, totalUnread: total });
  },

  resetAll: () => set({ activeConversationId: null, unreadCounts: {}, totalUnread: 0 }),
}));
