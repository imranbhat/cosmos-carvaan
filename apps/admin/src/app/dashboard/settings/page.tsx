"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Check } from "lucide-react";
import { saveSettings, getSettings } from "../actions";

export default function SettingsPage() {
  const [general, setGeneral] = useState({
    platformName: "Carvaan",
    currency: "INR",
    defaultLanguage: "en",
  });

  const [commission, setCommission] = useState({
    sellerCommission: "2.5",
    featuredListingFee: "50",
    premiumListingFee: "150",
  });

  const [notifications, setNotifications] = useState({
    newListing: true,
    newUser: true,
    listingExpired: false,
    reportedListing: true,
    dailyDigest: true,
    weeklyReport: true,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings();
        if (data) {
          setGeneral({
            platformName: data.platformName ?? "Carvaan",
            currency: data.currency ?? "INR",
            defaultLanguage: data.defaultLanguage ?? "en",
          });
          setCommission({
            sellerCommission: data.sellerCommission ?? "2.5",
            featuredListingFee: data.featuredListingFee ?? "50",
            premiumListingFee: data.premiumListingFee ?? "150",
          });
          if (data.notifications) {
            setNotifications((prev) => ({ ...prev, ...data.notifications }));
          }
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await saveSettings({
        ...general,
        ...commission,
        notifications,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save settings:", e);
    } finally {
      setSaving(false);
    }
  }

  if (loadingSettings) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl border border-admin-border bg-surface" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* General Settings */}
      <div className="rounded-xl border border-admin-border bg-surface shadow-sm">
        <div className="border-b border-admin-border px-6 py-4">
          <h2 className="text-base font-semibold text-admin-text">
            General Settings
          </h2>
          <p className="mt-0.5 text-sm text-admin-text-secondary">
            Configure basic platform settings
          </p>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-admin-text">
              Platform Name
            </label>
            <input
              type="text"
              value={general.platformName}
              onChange={(e) =>
                setGeneral({ ...general, platformName: e.target.value })
              }
              className="w-full rounded-lg border border-admin-border bg-surface px-3.5 py-2.5 text-sm text-admin-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-admin-text">
                Default Currency
              </label>
              <select
                value={general.currency}
                onChange={(e) =>
                  setGeneral({ ...general, currency: e.target.value })
                }
                className="w-full rounded-lg border border-admin-border bg-surface px-3.5 py-2.5 text-sm text-admin-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="INR">INR - Indian Rupee (₹)</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-admin-text">
                Default Language
              </label>
              <select
                value={general.defaultLanguage}
                onChange={(e) =>
                  setGeneral({ ...general, defaultLanguage: e.target.value })
                }
                className="w-full rounded-lg border border-admin-border bg-surface px-3.5 py-2.5 text-sm text-admin-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ur">Urdu</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Settings */}
      <div className="rounded-xl border border-admin-border bg-surface shadow-sm">
        <div className="border-b border-admin-border px-6 py-4">
          <h2 className="text-base font-semibold text-admin-text">
            Commission Settings
          </h2>
          <p className="mt-0.5 text-sm text-admin-text-secondary">
            Set commission rates and listing fees
          </p>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-admin-text">
              Seller Commission (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={commission.sellerCommission}
              onChange={(e) =>
                setCommission({
                  ...commission,
                  sellerCommission: e.target.value,
                })
              }
              className="w-full rounded-lg border border-admin-border bg-surface px-3.5 py-2.5 text-sm text-admin-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-admin-text">
                Featured Listing Fee (₹)
              </label>
              <input
                type="number"
                value={commission.featuredListingFee}
                onChange={(e) =>
                  setCommission({
                    ...commission,
                    featuredListingFee: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-admin-border bg-surface px-3.5 py-2.5 text-sm text-admin-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-admin-text">
                Premium Listing Fee (₹)
              </label>
              <input
                type="number"
                value={commission.premiumListingFee}
                onChange={(e) =>
                  setCommission({
                    ...commission,
                    premiumListingFee: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-admin-border bg-surface px-3.5 py-2.5 text-sm text-admin-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="rounded-xl border border-admin-border bg-surface shadow-sm">
        <div className="border-b border-admin-border px-6 py-4">
          <h2 className="text-base font-semibold text-admin-text">
            Notification Settings
          </h2>
          <p className="mt-0.5 text-sm text-admin-text-secondary">
            Choose which notifications you receive
          </p>
        </div>
        <div className="divide-y divide-admin-border">
          {[
            {
              key: "newListing" as const,
              label: "New Listing",
              desc: "Get notified when a new listing is submitted for review",
            },
            {
              key: "newUser" as const,
              label: "New User Registration",
              desc: "Get notified when a new user signs up",
            },
            {
              key: "listingExpired" as const,
              label: "Listing Expired",
              desc: "Get notified when a listing expires",
            },
            {
              key: "reportedListing" as const,
              label: "Reported Listing",
              desc: "Get notified when a listing is reported by users",
            },
            {
              key: "dailyDigest" as const,
              label: "Daily Digest",
              desc: "Receive a daily summary of platform activity",
            },
            {
              key: "weeklyReport" as const,
              label: "Weekly Report",
              desc: "Receive a weekly analytics report via email",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="text-sm font-medium text-admin-text">
                  {item.label}
                </p>
                <p className="text-sm text-admin-text-secondary">{item.desc}</p>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    [item.key]: !notifications[item.key],
                  })
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  notifications[item.key] ? "bg-primary" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    notifications[item.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
            <Check className="h-4 w-4" />
            Settings saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
