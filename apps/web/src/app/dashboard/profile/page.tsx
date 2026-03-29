"use client";

import { useEffect, useState, useRef } from "react";
import {
  User,
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface Profile {
  full_name: string;
  phone: string;
  city: string;
  avatar_url: string;
}

const CITIES = [
  "Srinagar",
  "Jammu",
  "Anantnag",
  "Baramulla",
  "Sopore",
  "Pulwama",
  "Budgam",
  "Kupwara",
  "Bandipora",
  "Ganderbal",
  "Shopian",
  "Kulgam",
  "Kathua",
  "Udhampur",
  "Rajouri",
  "Poonch",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone: "",
    city: "Srinagar",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [email, setEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");

      const { data } = await supabaseBrowser
        .from("profiles")
        .select("full_name, phone, city, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          city: data.city ?? "Srinagar",
          avatar_url: data.avatar_url ?? "",
        });
      }
      setLoading(false);
    }

    fetchProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();
    if (!user) {
      setMessage({ type: "error", text: "Not authenticated." });
      setSaving(false);
      return;
    }

    const { error } = await supabaseBrowser
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        city: profile.city,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setMessage({ type: "error", text: "Failed to save profile. Please try again." });
    } else {
      setMessage({ type: "success", text: "Profile saved successfully!" });
    }
    setSaving(false);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabaseBrowser.storage
      .from("car-photos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage({ type: "error", text: "Failed to upload avatar." });
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabaseBrowser.storage.from("car-photos").getPublicUrl(path);

    setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Profile</h1>
        <p className="text-text-secondary">Manage your personal information</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 max-w-2xl">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-primary/50" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="font-semibold text-text">
              {profile.full_name || "Your Name"}
            </p>
            <p className="text-sm text-text-secondary">{email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, full_name: e.target.value }))
              }
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text-tertiary cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Email cannot be changed here.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="e.g. +91 9876543210"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              City
            </label>
            <select
              value={profile.city}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, city: e.target.value }))
              }
              className="w-full appearance-none rounded-xl border border-border bg-bg px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-5 flex items-center gap-2 p-4 rounded-xl text-sm ${
              message.type === "success"
                ? "bg-success/10 text-success"
                : "bg-error/10 text-error"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Save */}
        <div className="mt-6 pt-6 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
