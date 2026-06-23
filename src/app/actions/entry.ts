"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/service/user";
import { revalidatePath } from "next/cache";
import { CreateEntryInput } from "@/types/entry";

export const deleteEntry = async (entryId: number) => {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  const { error, count } = await supabase
    .from("entry")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId)
    .select("id");

  if (error) throw error;
  if (count === 0) throw new Error("No entry deleted");

  // Revalidate the insights page to show updated entry list
  revalidatePath("/protected/insights");
};

export const updateEntry = async (
  entryId: number,
  updateEntryInput: CreateEntryInput,
): Promise<void> => {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  // Update the entry
  const { error: entryError } = await supabase
    .from("entry")
    .update({
      recorded_at: updateEntryInput.recordedAt.toISOString(),
      comment: updateEntryInput.comment,
    })
    .eq("id", entryId)
    .eq("user_id", userId);

  if (entryError) {
    throw new Error("Failed to update entry: " + entryError.message);
  }

  // Delete existing entry values
  const { error: deleteError } = await supabase
    .from("entry_value")
    .delete()
    .eq("entry_id", entryId);

  if (deleteError) {
    throw new Error("Failed to delete entry values: " + deleteError.message);
  }

  // Insert new entry values
  const valuesToInsert = updateEntryInput.values.map((value) => ({
    entry_id: entryId,
    metric_id: value.metricId,
    value: value.value,
  }));

  const { error: valuesError } = await supabase
    .from("entry_value")
    .insert(valuesToInsert);

  if (valuesError) {
    throw new Error("Failed to update entry values: " + valuesError.message);
  }

  // Revalidate the insights page to show updated entry
  revalidatePath("/protected/insights");
};
