"use client";

import { Entry as EntryType } from "@/types/entry";
import { Entry } from "./entry";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEntry } from "@/app/actions/entry";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import EntryEditDialog from "@/components/entry/entry-edit-dialog";

export default function EntriesList({ entries }: { entries: EntryType[] }) {
  const [editingEntry, setEditingEntry] = useState<EntryType | null>(null);
  const router = useRouter();

  const handleDelete = async (entryId: number) => {
    try {
      await deleteEntry(entryId);
      toast("Entry deleted successfully", {
        icon: <CheckIcon />,
      });
      router.refresh();
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
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
