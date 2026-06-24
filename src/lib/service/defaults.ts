import { createClient } from "@/lib/supabase/server";
import { Default, TrackingDefaultSchema } from "@/types/default";
import { z } from "zod";

export const getTrackingDefaults = async (): Promise<Default[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tracking_default").select("*");

  if (error || !data) {
    throw new Error(`Error fetching system metrics: ${error.message}`);
  }

  return z.array(TrackingDefaultSchema).parse(data);
};
