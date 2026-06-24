"use client";

import { format, differenceInDays } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Entry } from "@/types/entry";
import { MetricTracking } from "@/types/tracking";
import { Button } from "@/components/ui/button";
import {
  type MetricConfig,
  buildMetricConfigs,
} from "@/lib/visualization-utils";

interface ChartProps {
  entries: Entry[];
  trackingData: MetricTracking[];
  startDate: Date;
  endDate: Date;
}

interface ChartDataPoint {
  timestamp: string;
  date: Date;
  [metricId: string]: number | string | Date | null;
}

export default function EntriesLineChart({
  entries,
  trackingData,
  startDate,
  endDate,
}: ChartProps) {
  // Build metric configurations with stable colors
  const metricsConfig = useMemo<MetricConfig[]>(
    () => buildMetricConfigs(trackingData),
    [trackingData],
  );

  // State - support multiple active metrics (up to 2)
  const [activeMetricIds, setActiveMetricIds] = useState<string[]>(
    metricsConfig[0]?.metricId ? [metricsConfig[0].metricId] : [],
  );

  // Update active metrics when metrics config changes
  useEffect(() => {
    if (metricsConfig.length > 0 && activeMetricIds.length === 0) {
      setActiveMetricIds([metricsConfig[0].metricId]);
    }
  }, [metricsConfig, activeMetricIds]);

  // Prepare chart data from entries
  const chartData = useMemo(() => {
    // Filter entries within the date range
    const filteredEntries = entries.filter(
      (entry) => entry.recordedAt >= startDate && entry.recordedAt <= endDate,
    );

    // Group by day and metric, collecting all values per day
    const dailyData = new Map<string, Map<string, number[]>>();
    filteredEntries.forEach((entry) => {
      const dateKey = format(entry.recordedAt, "yyyy-MM-dd");
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, new Map());
      }
      const dayData = dailyData.get(dateKey)!;
      entry.values.forEach((value) => {
        if (!dayData.has(value.metricId)) {
          dayData.set(value.metricId, []);
        }
        dayData.get(value.metricId)!.push(value.value);
      });
    });

    // Get all metric IDs from trackingData
    const allMetricIds = trackingData.map((td) => td.metric.id);

    // Generate all days in the range
    const dataPoints: ChartDataPoint[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = format(currentDate, "yyyy-MM-dd");
      const metrics = dailyData.get(dateKey);

      const dataPoint: ChartDataPoint = {
        timestamp: dateKey,
        date: new Date(currentDate),
      };

      // Add all metrics with averaged values or null
      allMetricIds.forEach((metricId) => {
        if (metrics && metrics.has(metricId)) {
          const values = metrics.get(metricId)!;
          dataPoint[metricId] =
            values.reduce((a, b) => a + b, 0) / values.length;
        } else {
          dataPoint[metricId] = null;
        }
      });

      dataPoints.push(dataPoint);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dataPoints;
  }, [entries, startDate, endDate, trackingData]);

  // Calculate time span to determine x-axis formatting
  const timeSpanDays = useMemo(() => {
    return differenceInDays(endDate, startDate);
  }, [startDate, endDate]);

  // X-axis tick formatter based on time span
  const xAxisTickFormatter = useCallback(
    (timestamp: string) => {
      const date = new Date(timestamp);
      if (timeSpanDays <= 7) {
        // For week or less: show day and month
        return format(date, "MMM d");
      } else if (timeSpanDays <= 31) {
        // For month or less: show day
        return format(date, "d");
      } else if (timeSpanDays <= 90) {
        // For quarter or less: show month and day
        return format(date, "MMM d");
      } else if (timeSpanDays <= 365) {
        // For year or less: show month
        return format(date, "MMM");
      } else {
        // For more than a year: show month and year
        return format(date, "MMM yy");
      }
    },
    [timeSpanDays],
  );

  // Determine tick interval based on time span
  const xAxisTicks = useMemo(() => {
    if (chartData.length === 0) return undefined;

    let interval: number;
    if (timeSpanDays <= 7) {
      interval = 1; // Every day
    } else if (timeSpanDays <= 31) {
      interval = Math.ceil(chartData.length / 10); // ~10 ticks
    } else if (timeSpanDays <= 90) {
      interval = Math.ceil(chartData.length / 8); // ~8 ticks
    } else {
      interval = Math.ceil(chartData.length / 6); // ~6 ticks
    }

    return chartData
      .filter((_, index) => index % interval === 0)
      .map((d) => d.timestamp);
  }, [chartData, timeSpanDays]);

  // Toggle metric - up to 2 can be active
  const toggleMetric = useCallback((metricId: string) => {
    setActiveMetricIds((prev) => {
      if (prev.includes(metricId)) {
        // Deselect if already selected (but keep at least one)
        return prev.length > 1 ? prev.filter((id) => id !== metricId) : prev;
      } else {
        // Add if less than 2 are selected
        return prev.length < 2 ? [...prev, metricId] : [prev[1], metricId];
      }
    });
  }, []);

  // Get the active metric configurations
  const activeMetrics = useMemo(
    () => metricsConfig.filter((m) => activeMetricIds.includes(m.metricId)),
    [metricsConfig, activeMetricIds],
  );

  // Y-axis domain based on all active metrics
  const yAxisDomain = useMemo(() => {
    if (activeMetrics.length === 0) return [0, 10];

    const allMins = activeMetrics.map((m) => m.minValue);
    const allMaxs = activeMetrics.map((m) => m.maxValue);
    const minValue = Math.min(...allMins);
    const maxValue = Math.max(...allMaxs);

    const padding = (maxValue - minValue) * 0.05;
    return [minValue - padding, maxValue + padding];
  }, [activeMetrics]);

  // Y-axis ticks for discrete metrics (only when single metric is active)
  const yAxisTicks = useMemo(() => {
    if (activeMetrics.length !== 1 || activeMetrics[0].type !== "discrete")
      return undefined;

    // Sort labels by their numeric value
    return Object.entries(activeMetrics[0].labels)
      .sort(([, valueA], [, valueB]) => valueA - valueB)
      .map(([, value]) => value);
  }, [activeMetrics]);

  // Y-axis tick formatter for discrete metrics (only when single metric is active)
  const yAxisTickFormatter = useCallback(
    (value: number) => {
      if (activeMetrics.length !== 1 || activeMetrics[0].type !== "discrete") {
        return Math.round(value).toString();
      }

      // Find the label for this value
      const labelEntry = Object.entries(activeMetrics[0].labels).find(
        ([, val]) => val === value,
      );
      return labelEntry ? labelEntry[0] : value.toString();
    },
    [activeMetrics],
  );

  return (
    <div className="w-full">
      {/* Chart with dark background */}
      <div
        className="w-full rounded-lg p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            key={activeMetricIds.join(",")}
            margin={{ top: 5, right: 30, left: 3, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
            />
            <XAxis
              dataKey="timestamp"
              stroke="rgba(255, 255, 255, 0.7)"
              tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
              tickFormatter={xAxisTickFormatter}
              ticks={xAxisTicks}
              angle={timeSpanDays > 90 ? 0 : -45}
              textAnchor={timeSpanDays > 90 ? "middle" : "end"}
              height={timeSpanDays > 90 ? 30 : 60}
            />
            <YAxis
              label={{
                angle: -90,
                position: "insideLeft",
                fill: "rgba(255, 255, 255, 0.7)",
              }}
              domain={yAxisDomain}
              ticks={yAxisTicks}
              tickFormatter={yAxisTickFormatter}
              allowDecimals={
                activeMetrics.length !== 1 ||
                activeMetrics[0]?.type !== "discrete"
              }
              stroke="rgba(255, 255, 255, 0.7)"
              tick={
                activeMetricIds.length === 2
                  ? false
                  : { fill: "rgba(255, 255, 255, 0.7)" }
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "white",
              }}
              labelStyle={{ color: "white" }}
              labelFormatter={(timestamp) =>
                format(new Date(timestamp), "MMM d, yyyy")
              }
            />

            {/* Min/max range and baseline for each active metric */}
            {activeMetrics.map((metric) => (
              <ReferenceArea
                key={`area-${metric.metricId}`}
                y1={metric.minValue}
                y2={metric.maxValue}
                fill={metric.color}
                fillOpacity={0.1}
                stroke="none"
              />
            ))}

            {activeMetrics.map((metric, index) => (
              <ReferenceLine
                key={`baseline-${metric.metricId}`}
                y={metric.baseline}
                stroke={metric.color}
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: `${metric.name} Baseline`,
                  fill: "rgba(255, 255, 255, 0.7)",
                  position:
                    index === 0 ? "insideTopRight" : "insideBottomRight",
                }}
              />
            ))}

            {/* Lines for each active metric */}
            {activeMetrics.map((metric) => (
              <Line
                key={`line-${metric.metricId}`}
                type="monotone"
                dataKey={metric.metricId}
                stroke={metric.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                name={metric.name}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend - Small and below chart */}
      <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
        {metricsConfig.map((metric) => (
          <Button
            key={metric.metricId}
            onClick={() => toggleMetric(metric.metricId)}
            variant="outline"
            size="sm"
            className={`px-2 py-1 h-auto text-xs font-medium transition-all duration-200 ${
              activeMetricIds.includes(metric.metricId)
                ? "bg-white border-gray-400 text-gray-900 shadow-sm"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  activeMetricIds.includes(metric.metricId)
                    ? "opacity-100"
                    : "opacity-40"
                }`}
                style={{ backgroundColor: metric.color }}
              />
              {metric.name}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
