import { getEntriesByUser } from "@/lib/service/entry";
import React from "react";
import { BackNav } from "@/components/back-nav";
import { getTrackedMetrics } from "@/lib/service/metric";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import InsightsViewer from "@/components/entry/visualization/insights-viewer";

export default async function InsightsPage() {
  const [entries, trackedMetrics] = await Promise.all([
    getEntriesByUser(),
    getTrackedMetrics(),
  ]);

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
                  Create your first entry:{" "}
                  <a
                    href="/protected/new-entry"
                    className="text-blue-500 underline"
                  >
                    New Entry
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
