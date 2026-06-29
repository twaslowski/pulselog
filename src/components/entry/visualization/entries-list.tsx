"use client";

import { Entry as EntryType } from "@/types/entry";
import { Entry } from "./entry";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEntry } from "@/lib/entry";
import toast, { CheckmarkIcon } from "react-hot-toast";
import EntryEditDialog from "@/components/entry/entry-edit-dialog";

export default function EntriesList({ entries }: { entries: EntryType[] }) {
  const [editingEntry, setEditingEntry] = useState<EntryType | null>(null);
  const router = useRouter();

  const handleDelete = async (entryId: number) => {
    try {
      await deleteEntry(entryId);
      toast("Entry deleted successfully", {
        icon: <CheckmarkIcon />,
      });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast("Failed to delete entry: " + message, {
        style: { background: "red", color: "white" },
      });
    }
  };

  const handleEditComplete = () => {
    setEditingEntry(null);
    router.refresh();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 justify-center gap-4">
        {entries.map((entry) => (
          <Entry
            key={entry.id}
            entry={entry}
            onEdit={() => setEditingEntry(entry)}
            onDelete={() => handleDelete(entry.id)}
          />
        ))}
      </div>

      {editingEntry && (
        <EntryEditDialog
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onComplete={handleEditComplete}
        />
      )}
    </>
  );
}
