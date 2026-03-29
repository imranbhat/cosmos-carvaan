"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";

const ALLOWED_STATUSES = ["active", "pending_review", "rejected", "sold", "expired", "draft"] as const;
type ListingStatus = typeof ALLOWED_STATUSES[number];

/** Verify the caller has a valid Supabase session. Throws if not authenticated. */
async function requireAuth(): Promise<string> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find((c) => c.name.includes("auth-token"));
  if (!authCookie?.value) throw new Error("Unauthorized");

  let accessToken: string | undefined;
  try {
    const parsed = JSON.parse(authCookie.value);
    accessToken = parsed?.access_token;
  } catch {
    try {
      const parsed = JSON.parse(Buffer.from(authCookie.value, "base64").toString());
      accessToken = parsed?.access_token;
    } catch {
      throw new Error("Unauthorized");
    }
  }
  if (!accessToken) throw new Error("Unauthorized");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return user.id;
}

export async function getListings() {
  await requireAuth();
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select(
      `id, year, price, status, views_count, featured, created_at,
       car_makes!inner(name),
       car_models!inner(name),
       listing_photos(url, is_primary),
       profiles!listings_seller_id_fkey(full_name)`
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Failed to fetch listings:", error);
    return [];
  }

  return (data ?? []).map((item: any) => {
    const photos = item.listing_photos ?? [];
    const primary = photos.find((p: any) => p.is_primary) ?? photos[0];
    return {
      id: item.id,
      photo: primary?.url ?? "",
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

export async function getListing(id: string) {
  await requireAuth();
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select(
      `id, year, price, price_currency, status, views_count, featured, created_at, mileage, condition, color, num_owners, description, negotiable, city,
       car_makes!inner(name),
       car_models!inner(name),
       car_variants(name, fuel_type, transmission, engine_cc),
       listing_photos(id, url, is_primary, position),
       profiles!listings_seller_id_fkey(id, full_name, phone, avatar_url)`
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch listing:", error);
    return null;
  }

  return data;
}

function auditLog(action: string, details: Record<string, unknown>) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    source: "admin",
    action,
    ...details,
  }));
}

export async function updateListingStatus(id: string, status: string) {
  const adminUserId = await requireAuth();
  if (!ALLOWED_STATUSES.includes(status as ListingStatus)) {
    return { success: false, error: `Invalid status: ${status}` };
  }
  const { error } = await supabaseAdmin
    .from("listings")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Failed to update listing status:", error);
    return { success: false, error: error.message };
  }
  auditLog("updateListingStatus", { listingId: id, status, adminUserId });
  return { success: true };
}

export async function toggleFeatured(id: string, featured: boolean) {
  const adminUserId = await requireAuth();
  const { error } = await supabaseAdmin
    .from("listings")
    .update({ featured })
    .eq("id", id);

  if (error) {
    console.error("Failed to toggle featured:", error);
    return { success: false, error: error.message };
  }
  auditLog("toggleFeatured", { listingId: id, featured, adminUserId });
  return { success: true };
}

export async function bulkUpdateStatus(ids: string[], status: string) {
  const adminUserId = await requireAuth();
  if (!ALLOWED_STATUSES.includes(status as ListingStatus)) {
    return { success: false, error: `Invalid status: ${status}` };
  }
  const { error } = await supabaseAdmin
    .from("listings")
    .update({ status })
    .in("id", ids);

  if (error) {
    console.error("Failed to bulk update status:", error);
    return { success: false, error: error.message };
  }
  auditLog("bulkUpdateStatus", { listingIds: ids, status, count: ids.length, adminUserId });
  return { success: true };
}

export async function bulkToggleFeatured(ids: string[], featured: boolean) {
  const adminUserId = await requireAuth();
  const { error } = await supabaseAdmin
    .from("listings")
    .update({ featured })
    .in("id", ids);

  if (error) {
    console.error("Failed to bulk toggle featured:", error);
    return { success: false, error: error.message };
  }
  auditLog("bulkToggleFeatured", { listingIds: ids, featured, count: ids.length, adminUserId });
  return { success: true };
}

export async function exportListingsCSV() {
  const adminUserId = await requireAuth();
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select(`
      id, year, price, status, views_count, featured, created_at, mileage, condition, color, num_owners, city,
      car_makes!inner(name),
      car_models!inner(name),
      profiles!listings_seller_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Failed to export listings CSV:", error);
    return "";
  }

  const rows = (data ?? []).map((item: any) => ({
    ID: item.id,
    Car: `${item.year} ${item.car_makes?.name ?? ""} ${item.car_models?.name ?? ""}`,
    Seller: item.profiles?.full_name ?? "",
    Price: item.price,
    Status: item.status,
    Views: item.views_count ?? 0,
    Mileage: item.mileage ?? "",
    City: item.city ?? "",
    Created: new Date(item.created_at).toISOString().split("T")[0],
  }));

  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]).join(",");
  const csv = rows
    .map((r) =>
      Object.values(r)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  auditLog("exportListingsCSV", { rowCount: rows.length, adminUserId });
  return `${headers}\n${csv}`;
}
