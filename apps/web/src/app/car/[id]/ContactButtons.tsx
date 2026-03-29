"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageCircle, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface ContactButtonsProps {
  carId: string;
  sellerName: string;
  variant: "desktop" | "mobile";
}

export default function ContactButtons({
  carId,
  sellerName,
  variant,
}: ContactButtonsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  const redirectToLogin = () => {
    router.push(`/auth/login?redirect=${encodeURIComponent(`/car/${carId}`)}`);
  };

  const handleShowPhone = async () => {
    if (!user) {
      redirectToLogin();
      return;
    }

    setPhoneLoading(true);
    try {
      // Attempt to fetch the seller phone from the listing's profile
      const { data } = await supabaseBrowser
        .from("listings")
        .select("profiles!seller_id(phone)")
        .eq("id", carId)
        .single();

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const phone = (data as any)?.profiles?.phone;
      /* eslint-enable @typescript-eslint/no-explicit-any */

      if (phone) {
        setPhoneNumber(phone);
      } else {
        setPhoneNumber("Not available");
      }
    } catch {
      setPhoneNumber("Not available");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      redirectToLogin();
      return;
    }

    setMessageLoading(true);
    setMessageError(false);
    try {
      const { error: insertError } = await supabaseBrowser.from("messages").insert({
        listing_id: carId,
        sender_id: user.id,
        body: `Hi ${sellerName}, I'm interested in this car. Is it still available?`,
      });
      if (insertError) {
        console.error("Failed to send message:", insertError);
        setMessageError(true);
      } else {
        setMessageSent(true);
      }
    } catch {
      setMessageError(true);
    } finally {
      setMessageLoading(false);
    }
  };

  if (variant === "mobile") {
    return (
      <div className="flex gap-3">
        {phoneNumber ? (
          <a
            href={phoneNumber !== "Not available" ? `tel:${phoneNumber}` : "#"}
            className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Phone className="h-4 w-4" />
            {phoneNumber}
          </a>
        ) : (
          <button
            onClick={handleShowPhone}
            disabled={phoneLoading}
            className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {!user ? (
              <>
                <LogIn className="h-4 w-4" />
                Sign in to Call
              </>
            ) : phoneLoading ? (
              "Loading..."
            ) : (
              <>
                <Phone className="h-4 w-4" />
                Call
              </>
            )}
          </button>
        )}
        <button
          onClick={handleSendMessage}
          disabled={messageLoading || messageSent}
          className={`flex-1 font-semibold py-3 rounded-xl border-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 ${
            messageError
              ? "bg-red-50 text-error border-error"
              : "bg-surface text-primary border-primary hover:bg-primary/5"
          }`}
        >
          {!user ? (
            <>
              <LogIn className="h-4 w-4" />
              Sign in to Message
            </>
          ) : messageSent ? (
            "Message Sent"
          ) : messageError ? (
            "Failed — Tap to Retry"
          ) : messageLoading ? (
            "Sending..."
          ) : (
            <>
              <MessageCircle className="h-4 w-4" />
              Message
            </>
          )}
        </button>
      </div>
    );
  }

  // Desktop variant
  return (
    <>
      {phoneNumber ? (
        <a
          href={phoneNumber !== "Not available" ? `tel:${phoneNumber}` : "#"}
          className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
        >
          <Phone className="h-4 w-4" />
          {phoneNumber}
        </a>
      ) : (
        <button
          onClick={handleShowPhone}
          disabled={phoneLoading}
          className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {!user ? (
            <>
              <LogIn className="h-4 w-4" />
              Sign in to Show Phone
            </>
          ) : phoneLoading ? (
            "Loading..."
          ) : (
            <>
              <Phone className="h-4 w-4" />
              Show Phone Number
            </>
          )}
        </button>
      )}
      <button
        onClick={handleSendMessage}
        disabled={messageLoading || messageSent}
        className={`w-full font-semibold py-3 rounded-xl border-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 ${
          messageError
            ? "bg-red-50 text-error border-error"
            : "bg-surface text-primary border-primary hover:bg-primary/5"
        }`}
      >
        {!user ? (
          <>
            <LogIn className="h-4 w-4" />
            Sign in to Message
          </>
        ) : messageSent ? (
          "Message Sent!"
        ) : messageError ? (
          "Failed — Click to Retry"
        ) : messageLoading ? (
          "Sending..."
        ) : (
          <>
            <MessageCircle className="h-4 w-4" />
            Send Message
          </>
        )}
      </button>
    </>
  );
}
