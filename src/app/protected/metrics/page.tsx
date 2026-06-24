"use client";

import useSWR from "swr";

import React from "react";
import MetricList from "@/components/metric/metric-list";
import { BackNav } from "@/components/back-nav";
import MetricCreationButton from "@/components/metric/metric-creation-button";
import { MetricDialogProvider } from "@/components/metric/metric-dialog-provider";
import { fetcher } from "@/lib/fetcher";
import { Metric } from "@/types/metric";
import { MetricTracking } from "@/types/tracking";
import { ErrorCard } from "@/components/error";
import LoadingAnimation from "@/components/loading";

export default function SettingsPage() {
  const {
    data: metrics,
    error: metricsError,
    isLoading: metricsLoading,
  } = useSWR<Metric[]>("/api/v1/metric", fetcher);
  const {
    data: metricTracking,
    error: metricTrackingError,
    isLoading: metricTrackingLoading,
  } = useSWR<MetricTracking[]>("/api/v1/tracking", fetcher);

  if (metricsLoading || metricTrackingLoading) {
    return <LoadingAnimation />;
  }

  if (metricsError || metricTrackingError) {
    return (
      <ErrorCard
        title="Error"
        message="An error occurred when loading metrics."
      />
    );
  }

  if (!metrics || !metricTracking) {
    return null;
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
