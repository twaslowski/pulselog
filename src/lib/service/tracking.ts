import { createClient } from "@/lib/supabase/server";
import { MetricTrackingSchema } from "@/types/tracking";
import { z } from "zod";
import { getTrackingDefaults } from "@/lib/service/defaults";

export const getUserTrackingInfo = async (userId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("metric_tracking")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    throw new Error(`Error fetching user tracking info: ${error?.message}`);
  }

  return z.array(MetricTrackingSchema).parse(data);
};

export const configureDefaultTracking = async (userId: string) => {
  const supabase = await createClient();

  // Validate that the user exists in the auth system
  const { data: user, error: userError } =
    await supabase.auth.admin.getUserById(userId);
  if (userError || !user) {
    throw new Error("Invalid userId provided: " + userError?.message);
  }

  // Check if user already has tracking configured
  const userTracking = await getUserTrackingInfo(userId);
  if (userTracking.length > 0) {
    console.log("User already has tracking configured", userId);
    return;
  }

  // Fetch tracking defaults
  const defaults = await getTrackingDefaults();
  if (!defaults || defaults.length === 0) {
    throw new Error("No tracking defaults found");
  }

  // Insert default tracking entries for the user
  for (const d of defaults) {
    const { error } = await supabase.from("metric_tracking").insert({
      user_id: userId,
      metric_id: d.metricId,
      baseline: d.baseline,
      tracked_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error("Failed to set up default tracking: " + error.message);
    }
  }

  console.log("Successfully set up tracking defaults for new user", userId);
};
