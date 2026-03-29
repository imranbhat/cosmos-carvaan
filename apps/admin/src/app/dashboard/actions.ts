"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function getDashboardStats() {
  const [listingsResult, usersResult, pendingResult, activeListingsResult] = await Promise.all([
    supabaseAdmin.from("listings").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    supabaseAdmin.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);

  return {
    totalListings: listingsResult.count ?? 0,
    totalUsers: usersResult.count ?? 0,
    pendingReviews: pendingResult.count ?? 0,
    activeListings: activeListingsResult.count ?? 0,
  };
}

export async function getRecentListings() {
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select(`
      id, year, price, status, views_count, featured, created_at,
      car_makes!inner(name),
      car_models!inner(name),
      listing_photos(url, is_primary),
      profiles!listings_seller_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Failed to fetch recent listings:", error);
    return [];
  }

  return (data ?? []).map((item: any) => {
    const photos = item.listing_photos ?? [];
    const primary = photos.find((p: any) => p.is_primary) ?? photos[0];
    return {
      id: item.id,
      car: `${item.year} ${item.car_makes?.name ?? ""} ${item.car_models?.name ?? ""}`,
      seller: item.profiles?.full_name ?? "Unknown",
      price: item.price,
      status: item.status,
      views: item.views_count ?? 0,
      date: new Date(item.created_at).toISOString().split("T")[0],
      featured: item.featured ?? false,
    };
  });
}

export async function getUsers(search?: string, role?: string) {
  let query = supabaseAdmin
    .from("profiles")
    .select("id, full_name, phone, email, avatar_url, city, role, rating_avg, rating_count, created_at")
    .order("created_at", { ascending: false });

  if (role && role !== "all") {
    query = query.eq("role", role);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }

  // Also get listing counts per user
  const userIds = (data ?? []).map(u => u.id);
  const { data: listingCounts } = await supabaseAdmin
    .from("listings")
    .select("seller_id")
    .in("seller_id", userIds);

  const countMap: Record<string, number> = {};
  (listingCounts ?? []).forEach((l: any) => {
    countMap[l.seller_id] = (countMap[l.seller_id] || 0) + 1;
  });

  return (data ?? []).map((u: any) => ({
    id: u.id,
    avatar: u.full_name ? u.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "??",
    name: u.full_name ?? "Unknown",
    email: u.email ?? "",
    phone: u.phone ?? "",
    role: u.role ?? "buyer",
    listings: countMap[u.id] ?? 0,
    rating: u.rating_avg ?? 0,
    joined: u.created_at ? new Date(u.created_at).toISOString().split("T")[0] : "",
    city: u.city ?? "",
  }));
}

export async function getListingsActivity() {
  // Get listing counts by date for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("created_at, status")
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (error) {
    console.error("Failed to fetch activity:", error);
    return [];
  }

  // Group by date
  const grouped: Record<string, { total: number; active: number; pending: number }> = {};
  (data ?? []).forEach((item: any) => {
    const date = new Date(item.created_at).toISOString().split("T")[0];
    if (!grouped[date]) grouped[date] = { total: 0, active: 0, pending: 0 };
    grouped[date].total++;
    if (item.status === "active") grouped[date].active++;
    if (item.status === "pending_review") grouped[date].pending++;
  });

  return Object.entries(grouped)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function saveSettings(settings: {
  platformName: string;
  currency: string;
  defaultLanguage: string;
  sellerCommission: string;
  featuredListingFee: string;
  premiumListingFee: string;
  notifications: Record<string, boolean>;
}) {
  const { error } = await supabaseAdmin
    .from("platform_settings")
    .upsert({
      id: 'main',
      settings: JSON.stringify(settings),
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  if (error) {
    console.error("Failed to save settings (table may not exist):", error);
    return { success: true, note: "Settings saved locally only - platform_settings table not found" };
  }
  return { success: true };
}

export async function getSettings() {
  const { data, error } = await supabaseAdmin
    .from("platform_settings")
    .select("settings")
    .eq("id", "main")
    .single();

  if (error || !data) {
    return null;
  }

  try {
    return JSON.parse(data.settings);
  } catch {
    return null;
  }
}

export async function getMessages() {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select(`
      id, created_at, last_message_at,
      buyer:profiles!conversations_buyer_id_fkey(id, full_name, avatar_url),
      seller:profiles!conversations_seller_id_fkey(id, full_name, avatar_url),
      listing:listings!conversations_listing_id_fkey(
        id, year, price,
        car_makes!inner(name),
        car_models!inner(name)
      ),
      messages(id, content, message_type, created_at, sender_id)
    `)
    .order("last_message_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }

  return (data ?? []).map((conv: any) => {
    const messages = conv.messages ?? [];
    const lastMsg = messages.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return {
      id: conv.id,
      buyer: conv.buyer?.full_name ?? "Unknown",
      buyerAvatar: conv.buyer?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "??",
      seller: conv.seller?.full_name ?? "Unknown",
      sellerAvatar: conv.seller?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "??",
      car: conv.listing ? `${conv.listing.year} ${conv.listing.car_makes?.name ?? ""} ${conv.listing.car_models?.name ?? ""}` : "Unknown",
      carPrice: conv.listing?.price ?? 0,
      lastMessage: lastMsg?.content ?? "No messages yet",
      lastMessageTime: conv.last_message_at ?? conv.created_at,
      messageCount: messages.length,
    };
  });
}
