"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/service/user";
import { redirect } from "next/navigation";
import { getEntriesByUser } from "@/lib/service/entry";
import { getAllMetrics } from "@/lib/service/metric";

export const deleteAccount = async () => {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  // Delete all data associated with the user (cascade should handle this)
  // But we'll explicitly delete related data for safety
  const { error: entriesError } = await supabase
    .from("entry")
    .delete()
    .eq("user_id", userId);

  if (entriesError) {
    throw new Error(`Failed to delete entries: ${entriesError.message}`);
  }

  const { error: metricsError } = await supabase
    .from("metric")
    .delete()
    .eq("owner_id", userId);

  if (metricsError) {
    throw new Error(`Failed to delete metrics: ${metricsError.message}`);
  }

  const { error: trackingError } = await supabase
    .from("metric_tracking")
    .delete()
    .eq("user_id", userId);

  if (trackingError) {
    throw new Error(`Failed to delete tracking data: ${trackingError.message}`);
  }

  // Delete the user from auth
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    throw new Error(`Failed to delete user account: ${authError.message}`);
  }

  redirect("/");
};

export const exportUserData = async () => {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  // Fetch user entries
  const entries = await getEntriesByUser();

  // Fetch all metrics (system metrics and user-owned metrics)
  const allMetrics = await getAllMetrics();

  // Fetch user-owned metrics
  const { data: userMetrics, error: userMetricsError } = await supabase
    .from("metric")
    .select("*")
    .eq("owner_id", userId);

  if (userMetricsError) {
    throw new Error(
      `Failed to fetch user metrics: ${userMetricsError.message}`,
    );
  }

  // Create and return the export data structure
  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: userId,
    },
    entries: entries,
    metrics: {
      system: allMetrics.filter((m) => m.owner_id !== userId),
      userOwned: userMetrics,
    },
  };
};
