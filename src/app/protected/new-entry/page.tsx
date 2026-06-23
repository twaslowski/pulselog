"use client";

import React, { useEffect, useState } from "react";
import { getTrackedMetrics } from "@/lib/tracking";
import EntryCreationForm from "@/components/entry/creation/entry-creation-form";
import { BackNav } from "@/components/back-nav";
import { MetricTracking } from "@/types/tracking";
import { DotLoader } from "react-spinners";

export default function CreateEntryPage() {
  const [trackedMetrics, setTrackedMetrics] = useState<MetricTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrackedMetrics() {
      try {
        setError(null);
        setLoading(true);
        const metrics = await getTrackedMetrics();
        setTrackedMetrics(metrics);
      } catch (error) {
        console.error("Error fetching tracked metrics:", error);
        setError("Failed to load tracked metrics. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    void fetchTrackedMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <DotLoader loading={true} size={32} color="currentColor" />
        <span className={`ml-3`}>Loading</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

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
