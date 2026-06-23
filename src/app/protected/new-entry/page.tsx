import React from "react";
import { getTrackedMetrics } from "@/lib/service/metric";
import EntryCreationForm from "@/components/entry/creation/entry-creation-form";
import { BackNav } from "@/components/back-nav";

export default async function CreateEntryPage() {
  const trackedMetrics = await getTrackedMetrics();

  return (
    <div className="h-full p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <BackNav href="/protected" />
          <h1 className="text-4xl font-bold mb-2">Create New Entry</h1>
          <p className="text-primary">
            Record your metrics for a specific point in time
          </p>
        </div>

        <EntryCreationForm trackedMetrics={trackedMetrics} />
      </div>
    </div>
  );
}
