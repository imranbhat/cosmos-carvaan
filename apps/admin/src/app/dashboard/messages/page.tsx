import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <MessageSquare className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-admin-text">Messages</h2>
      <p className="mt-2 max-w-sm text-sm text-admin-text-secondary">
        Buyer-seller conversations will appear here. This feature is coming soon.
      </p>
    </div>
  );
}
