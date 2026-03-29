"use client";

import { useEffect, useState } from "react";
import { MessageSquare, ArrowRight } from "lucide-react";
import { getMessages } from "../actions";

interface Conversation {
  id: string;
  buyer: string;
  buyerAvatar: string;
  seller: string;
  sellerAvatar: string;
  car: string;
  carPrice: number;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
}

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toISOString().split("T")[0];
}

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getMessages();
        setConversations(data);
      } catch (e) {
        console.error("Failed to load messages:", e);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-admin-border bg-surface" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-admin-text">No Conversations Yet</h2>
        <p className="mt-2 max-w-sm text-sm text-admin-text-secondary">
          Buyer-seller conversations will appear here once users start messaging about listings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-admin-text">
          Conversations ({conversations.length})
        </h2>
      </div>

      <div className="space-y-3">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="rounded-xl border border-admin-border bg-surface p-5 shadow-sm transition-colors hover:bg-admin-bg/20"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Participants */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                    {conv.buyerAvatar}
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-admin-text-tertiary" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                    {conv.sellerAvatar}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-admin-text">
                    {conv.buyer}
                    <span className="mx-1.5 text-admin-text-tertiary">&rarr;</span>
                    {conv.seller}
                  </p>
                  <p className="text-xs text-admin-text-secondary">
                    {conv.car}
                    {conv.carPrice > 0 && (
                      <span className="ml-2 font-medium text-admin-text">
                        {formatPrice(conv.carPrice)}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-admin-text-tertiary">
                  {formatTimeAgo(conv.lastMessageTime)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-admin-bg px-2 py-0.5 text-xs text-admin-text-secondary">
                  <MessageSquare className="h-3 w-3" />
                  {conv.messageCount}
                </span>
              </div>
            </div>

            {/* Last message preview */}
            <div className="mt-3 rounded-lg bg-admin-bg/50 px-3.5 py-2.5">
              <p className="truncate text-sm text-admin-text-secondary">
                {conv.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
