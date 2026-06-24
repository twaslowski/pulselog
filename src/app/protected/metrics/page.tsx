"use client";

import useSWR from "swr";

import React from "react";
import MetricList from "@/components/metric/metric-list";
import { BackNav } from "@/components/back-nav";
import MetricCreationButton from "@/components/metric/metric-creation-button";
import { MetricDialogProvider } from "@/components/metric/metric-dialog-provider";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function SettingsPage() {
  const {
    data: metrics,
    error: metricsError,
    isLoading: metricsLoading,
  } = useSWR("/api/v1/metric", fetcher);
  const {
    data: metricTracking,
    error: metricTrackingError,
    isLoading: metricTrackingLoading,
  } = useSWR("/api/v1/tracking", fetcher);

  if (metricsLoading || metricTrackingLoading) {
    return <div>Loading...</div>;
  }

  if (metricsError || metricTrackingError) {
    return <div>Error loading metrics</div>;
  }

  return (
    <MetricDialogProvider>
      <div className="h-full p-2">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <BackNav href="/protected" />
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold">Metric Settings</h1>
              <div className="gap-2 flex">
                <MetricCreationButton />
              </div>
            </div>
            <p className="text-muted-foreground">
              Configure which metrics you want to track in your mood journal
            </p>
          </div>

          <MetricList metrics={metrics} metricTracking={metricTracking} />
        </div>
      </div>
    </MetricDialogProvider>
  );
}
