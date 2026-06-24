"use client";

import { getEntries } from "@/lib/entry";
import React, { useEffect, useState } from "react";
import { BackNav } from "@/components/back-nav";
import { getTrackedMetrics } from "@/lib/tracking";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import InsightsViewer from "@/components/entry/visualization/insights-viewer";
import { MetricTracking } from "@/types/tracking";
import { Entry } from "@/types/entry";

export default function InsightsPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [trackedMetrics, setTrackedMetrics] = useState<MetricTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedEntries, fetchedMetrics] = await Promise.all([
          getEntries(),
          getTrackedMetrics(),
        ]);
        console.log("Fetched entries:", fetchedEntries);
        setEntries(fetchedEntries);
        setTrackedMetrics(fetchedMetrics);
      } catch (err) {
        console.warn(err);
        setError(err instanceof Error ? err : new Error("Failed to load data"));
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col p-4 h-full">
        <div className="space-y-6">
          <div>
            <BackNav href="/protected" />
          </div>
          <Card className="max-w-2xl flex flex-col items-center justify-center text-center mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">Loading insights...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col p-4 h-full">
        <div className="space-y-6">
          <div>
            <BackNav href="/protected" />
          </div>
          <Card className="max-w-2xl flex flex-col items-center justify-center text-center mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">Something went wrong.</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col p-4 h-full">
        <div className="space-y-6">
          <div>
            <BackNav href="/protected" />
          </div>
          <Card className="max-w-2xl flex flex-col items-center justify-center text-center mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">No entries found.</CardTitle>
              <CardDescription>
                <p>
                  Start logging your moods and metrics to see insights here!
                </p>
                <p>
                  <a
                    href="/protected/new-entry"
                    className="text-blue-500 underline"
                  >
                    Create your first entry New Entry
                  </a>
                </p>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 h-full">
      <div className="space-y-6">
        <InsightsViewer entries={entries} trackingData={trackedMetrics} />
      </div>
    </div>
  );
}
