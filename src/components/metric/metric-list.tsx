"use client";

import { type MetricTracking } from "@/types/tracking";
import { type Metric } from "@/types/metric";
import {
  trackMetric,
  untrackMetric,
  updateBaseline,
} from "@/app/actions/metric";
import React, { useState, useTransition, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricCard from "@/components/metric/metric-card";

interface MetricListProps {
  metrics: Metric[];
  metricTracking: MetricTracking[];
}

export default function MetricList({
  metrics,
  metricTracking,
}: MetricListProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("tracked");

  const [optimisticTracking, setOptimisticTracking] = useState<
    Map<string, MetricTracking>
  >(new Map(metricTracking.map((tracking) => [tracking.metric.id, tracking])));

  // Categorize metrics
  const categorizedMetrics = useMemo(() => {
    const tracked: Metric[] = [];
    const user: Metric[] = [];
    const system: Metric[] = [];

    metrics.forEach((metric) => {
      const isTracked = optimisticTracking.has(metric.id);

      if (isTracked) {
        tracked.push(metric);
      }

      if (metric.owner_id === "SYSTEM") {
        system.push(metric);
      } else {
        user.push(metric);
      }
    });

    return { tracked, user, system };
  }, [metrics, optimisticTracking]);

  const handleToggle = async (metric: Metric, isCurrentlyTracked: boolean) => {
    const newTracking = new Map(optimisticTracking);

    if (isCurrentlyTracked) {
      newTracking.delete(metric.id);
    } else {
      // Create optimistic tracking entry
      newTracking.set(metric.id, {
        userId: "",
        trackedAt: new Date().toISOString(),
        baseline: 0,
        metric: metric,
      });
    }
    setOptimisticTracking(newTracking);

    // Perform server action
    startTransition(async () => {
      try {
        if (isCurrentlyTracked) {
          await untrackMetric(metric.id);
        } else {
          await trackMetric(metric.id, 0);
        }
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticTracking(
          new Map(
            metricTracking.map((tracking) => [tracking.metric.id, tracking]),
          ),
        );
        console.error("Failed to toggle metric:", error);
      }
    });
  };

  const handleBaselineUpdate = async (
    metricId: string,
    newBaseline: number,
  ) => {
    const currentTracking = optimisticTracking.get(metricId);
    if (!currentTracking) return;

    // Optimistic update
    const newTracking = new Map(optimisticTracking);
    newTracking.set(metricId, { ...currentTracking, baseline: newBaseline });
    setOptimisticTracking(newTracking);

    // Perform server action
    startTransition(async () => {
      try {
        await updateBaseline(metricId, newBaseline);
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticTracking(
          new Map(
            metricTracking.map((tracking) => [tracking.metric.id, tracking]),
          ),
        );
        console.error("Failed to update baseline:", error);
      }
    });
  };

  const renderMetricCard = (metric: Metric) => {
    const tracking = optimisticTracking.get(metric.id);
    const isTracked = !!tracking;
    return (
      <MetricCard
        key={metric.id}
        metric={metric}
        tracking={tracking}
        isTracked={isTracked}
        isPending={isPending}
        handleToggle={handleToggle}
        handleBaselineUpdate={handleBaselineUpdate}
      />
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tracked">
          Tracked ({categorizedMetrics.tracked.length})
        </TabsTrigger>
        <TabsTrigger value="user">
          User ({categorizedMetrics.user.length})
        </TabsTrigger>
        <TabsTrigger value="system">
          System ({categorizedMetrics.system.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tracked" className="space-y-4">
        {categorizedMetrics.tracked.length > 0 ? (
          categorizedMetrics.tracked.map(renderMetricCard)
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No tracked metrics yet. Switch to User or System tabs to track
            metrics.
          </div>
        )}
      </TabsContent>

      <TabsContent value="user" className="space-y-4">
        {categorizedMetrics.user.length > 0 ? (
          categorizedMetrics.user.map(renderMetricCard)
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No user-created metrics yet.
          </div>
        )}
      </TabsContent>

      <TabsContent value="system" className="space-y-4">
        {categorizedMetrics.system.length > 0 ? (
          categorizedMetrics.system.map(renderMetricCard)
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No system metrics available.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
