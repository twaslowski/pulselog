"use client";

import React, { useMemo } from "react";
import { Entry } from "@/types/entry";
import { MetricTracking } from "@/types/tracking";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

interface StatsProps {
  entries: Entry[];
  trackingData: MetricTracking[];
}

interface MetricStats {
  metricId: string;
  metricName: string;
  average: number;
  min: number;
  max: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
  recentAverage: number;
  previousAverage: number;
}

interface CorrelationResult {
  metric1: string;
  metric2: string;
  correlation: number;
  strength: "strong" | "moderate" | "weak";
}

const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
  );

  if (denominator === 0) return 0;
  return numerator / denominator;
};

const getCorrelationStrength = (
  correlation: number,
): "strong" | "moderate" | "weak" => {
  const abs = Math.abs(correlation);
  if (abs >= 0.7) return "strong";
  if (abs >= 0.4) return "moderate";
  return "weak";
};

export default function EntriesStats({ entries, trackingData }: StatsProps) {
  const overallStats = useMemo(() => {
    const totalEntries = entries.length;
    const trackedMetrics = trackingData.length;

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const entriesLast7Days = entries.filter(
      (entry) => new Date(entry.recordedAt) >= sevenDaysAgo,
    ).length;

    const oldestEntry =
      entries.length > 0
        ? new Date(
            Math.min(...entries.map((e) => new Date(e.recordedAt).getTime())),
          )
        : null;

    const daysSinceFirstEntry = oldestEntry
      ? Math.floor(
          (now.getTime() - oldestEntry.getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;

    return {
      totalEntries,
      trackedMetrics,
      entriesLast7Days,
      daysSinceFirstEntry,
      avgEntriesPerWeek:
        daysSinceFirstEntry > 0
          ? ((totalEntries / daysSinceFirstEntry) * 7).toFixed(1)
          : "0",
    };
  }, [entries, trackingData]);

  const metricStats = useMemo((): MetricStats[] => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 60);

    const metricMap = new Map<
      string,
      {
        name: string;
        values: number[];
        recentValues: number[];
        previousValues: number[];
      }
    >();

    entries.forEach((entry) => {
      const entryDate = new Date(entry.recordedAt);
      entry.values.forEach((value) => {
        if (!metricMap.has(value.metric.id)) {
          metricMap.set(value.metric.id, {
            name: value.metric.name,
            values: [],
            recentValues: [],
            previousValues: [],
          });
        }
        const metric = metricMap.get(value.metric.id)!;
        metric.values.push(value.value);

        if (entryDate >= thirtyDaysAgo) {
          metric.recentValues.push(value.value);
        } else if (entryDate >= sixtyDaysAgo) {
          metric.previousValues.push(value.value);
        }
      });
    });

    return Array.from(metricMap.entries()).map(([metricId, data]) => {
      const average =
        data.values.reduce((a, b) => a + b, 0) / data.values.length;
      const min = Math.min(...data.values);
      const max = Math.max(...data.values);

      const recentAverage =
        data.recentValues.length > 0
          ? data.recentValues.reduce((a, b) => a + b, 0) /
            data.recentValues.length
          : average;

      const previousAverage =
        data.previousValues.length > 0
          ? data.previousValues.reduce((a, b) => a + b, 0) /
            data.previousValues.length
          : average;

      let trend: "up" | "down" | "stable" = "stable";
      let trendPercentage = 0;

      if (data.previousValues.length > 0) {
        const change =
          ((recentAverage - previousAverage) / previousAverage) * 100;
        trendPercentage = Math.abs(change);
        if (change > 5) trend = "up";
        else if (change < -5) trend = "down";
      }

      return {
        metricId,
        metricName: data.name,
        average,
        min,
        max,
        trend,
        trendPercentage,
        recentAverage,
        previousAverage,
      };
    });
  }, [entries]);

  const correlations = useMemo((): CorrelationResult[] => {
    if (metricStats.length < 2) return [];

    const metricValueArrays = new Map<
      string,
      { name: string; values: number[] }
    >();

    // Group values by entry date to ensure proper pairing
    const entriesByDate = new Map<string, Map<string, number>>();
    entries.forEach((entry) => {
      const dateKey = entry.recordedAt.toISOString();
      const metricsInEntry = new Map<string, number>();
      entry.values.forEach((value) => {
        metricsInEntry.set(value.metric.id, value.value);
      });
      entriesByDate.set(dateKey, metricsInEntry);
    });

    // Build aligned arrays for each metric
    metricStats.forEach((stat) => {
      const values: number[] = [];
      entriesByDate.forEach((metricsInEntry) => {
        if (metricsInEntry.has(stat.metricId)) {
          values.push(metricsInEntry.get(stat.metricId)!);
        }
      });
      if (values.length >= 3) {
        metricValueArrays.set(stat.metricId, { name: stat.metricName, values });
      }
    });

    const results: CorrelationResult[] = [];
    const metricIds = Array.from(metricValueArrays.keys());

    for (let i = 0; i < metricIds.length; i++) {
      for (let j = i + 1; j < metricIds.length; j++) {
        const metric1 = metricValueArrays.get(metricIds[i])!;
        const metric2 = metricValueArrays.get(metricIds[j])!;

        // Find common entries
        const values1: number[] = [];
        const values2: number[] = [];

        entriesByDate.forEach((metricsInEntry) => {
          if (
            metricsInEntry.has(metricIds[i]) &&
            metricsInEntry.has(metricIds[j])
          ) {
            values1.push(metricsInEntry.get(metricIds[i])!);
            values2.push(metricsInEntry.get(metricIds[j])!);
          }
        });

        if (values1.length >= 3) {
          const correlation = calculateCorrelation(values1, values2);
          if (!isNaN(correlation) && Math.abs(correlation) > 0.2) {
            results.push({
              metric1: metric1.name,
              metric2: metric2.name,
              correlation,
              strength: getCorrelationStrength(correlation),
            });
          }
        }
      }
    }

    return results.sort(
      (a, b) => Math.abs(b.correlation) - Math.abs(a.correlation),
    );
  }, [entries, metricStats]);

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Statistics</CardTitle>
          <CardDescription>Your tracking journey at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">{overallStats.totalEntries}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tracked Metrics</p>
              <p className="text-2xl font-bold">
                {overallStats.trackedMetrics}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last 7 Days</p>
              <p className="text-2xl font-bold">
                {overallStats.entriesLast7Days}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg/Week</p>
              <p className="text-2xl font-bold">
                {overallStats.avgEntriesPerWeek}
              </p>
            </div>
          </div>
          {overallStats.daysSinceFirstEntry > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Tracking for {overallStats.daysSinceFirstEntry} days
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metric Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Metric Trends</CardTitle>
          <CardDescription>
            Last 30 days compared to previous 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metricStats.length === 0 ? (
            <p className="text-muted-foreground">No metric data available</p>
          ) : (
            <div className="space-y-4">
              {metricStats.map((stat) => (
                <div
                  key={stat.metricId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{stat.metricName}</h4>
                      <TrendIcon trend={stat.trend} />
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span>Avg: {stat.average.toFixed(1)}</span>
                      <span>Min: {stat.min.toFixed(1)}</span>
                      <span>Max: {stat.max.toFixed(1)}</span>
                    </div>
                  </div>
                  {stat.trend !== "stable" && (
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {stat.trend === "up" ? "+" : "-"}
                        {stat.trendPercentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.recentAverage.toFixed(1)} vs{" "}
                        {stat.previousAverage.toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Correlations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Metric Correlations
          </CardTitle>
          <CardDescription>
            Discover relationships between your tracked metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {correlations.length === 0 ? (
            <p className="text-muted-foreground">
              Not enough data to calculate correlations. Track multiple metrics
              across several entries to see relationships.
            </p>
          ) : (
            <div className="space-y-3">
              {correlations.slice(0, 10).map((corr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {corr.metric1} ↔ {corr.metric2}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {corr.strength}{" "}
                      {corr.correlation > 0 ? "positive" : "negative"}{" "}
                      correlation
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium">
                      {corr.correlation.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {correlations.length > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing top 10 correlations out of {correlations.length}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
