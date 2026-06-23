import { createClient } from "@/lib/supabase/server";
import { DBEntrySchema, type Entry } from "@/types/entry";
import { z } from "zod";
import { getUserId } from "@/lib/service/user";

export const getEntriesByUser = async (): Promise<Entry[]> => {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  const { data, error } = await supabase
    .from("entry")
    .select("*, entry_value(*, metric:metric_id(*))")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch entries: " + error.message);
  }

  return z.array(DBEntrySchema).parse(data);
};
