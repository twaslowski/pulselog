"use client";

import React from "react";
import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type EntryValue } from "@/types/entry-value";
import { createEntry } from "@/app/actions/entry";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  values: EntryValue[];
  comment: string;
  recorded_at: string;
  disabled?: boolean;
}

export default function SubmitButton({
  values,
  comment,
  recorded_at,
  disabled,
}: SubmitButtonProps) {
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      await createEntry({ comment, values, recorded_at });
      router.push("/protected?success=true");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create entry. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push("/protected");
  };

  return (
    <div className="flex gap-4 pt-4">
      <Button
        onClick={handleSubmit}
        disabled={disabled}
        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <Save className="w-5 h-5" />
        Save Entry
      </Button>
      <Button onClick={handleCancel} className="">
        <X className="w-5 h-5" aria-label="submit-entry" />
        Cancel
      </Button>
    </div>
  );
}
