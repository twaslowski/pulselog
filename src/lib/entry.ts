import { CreateEntryInput, Entry, EntrySchema } from "@/types/entry";
import { z } from "zod";

export async function createEntry(payload: CreateEntryInput) {
  const response = await fetch("/api/v1/entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create new entry");
  }
}

export async function getEntries(): Promise<Entry[]> {
  const response = await fetch("/api/v1/entry", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch entries");
  }

  const { success, error, data } = await response
    .json()
    .then((json) => z.array(EntrySchema).safeParse(json));

  if (!success) {
    console.warn("Failed to parse entries:", error);
    throw new Error("Could not parse response from server.");
  }

  return data;
}

export async function deleteEntry(id: number): Promise<void> {
  const response = await fetch(`/api/v1/entry/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete entry");
  }
}

export async function updateEntry(
  entryId: number,
  updateEntryInput: CreateEntryInput,
): Promise<void> {
  const response = await fetch(`/api/v1/entry/${entryId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateEntryInput),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update entry");
  }
}
