/**
 * Shared utility functions for data visualization components
 * Consolidates common data transformation logic used across charts
 */

import { Entry } from "@/types/entry";
import { EntryValue } from "@/types/entry-value";
import { Metric } from "@/types/metric";
import { MetricTracking } from "@/types/tracking";
import { endOfMonth, format, startOfMonth } from "date-fns";

// ============================================================================
// Time Period Extraction
// ============================================================================

/**
 * Extract all unique years from entries
 * @param entries - Array of entries
 * @returns Sorted array of year strings
 */
export function extractAvailableYears(entries: Entry[]): string[] {
  const years = new Set(
    entries.map((e) => e.recordedAt.getFullYear().toString()),
  );
  return Array.from(years).sort();
}

/**
 * Extract all unique months from entries in YYYY-MM format
 * @param entries - Array of entries
 * @returns Sorted array of month strings
 */
export function extractAvailableMonths(entries: Entry[]): string[] {
  const months = new Set(
    entries.map((e) => format(new Date(e.recordedAt), "yyyy-MM")),
  );
  return Array.from(months).sort();
}

// ============================================================================
// Metric Extraction & Configuration
// ============================================================================

/**
 * Extract all available metrics from entries (by name)
 * @param entries - Array of entries
 * @returns Map of metric name (lowercase) to Metric object
 */
export function extractAvailableMetrics(entries: Entry[]): Map<string, Metric> {
  const metrics = new Map<string, Metric>();
  entries.forEach((entry) => {
    entry.values.forEach((value) => {
      metrics.set(value.metric.name.toLowerCase(), value.metric);
    });
  });
  return metrics;
}

/**
 * Configuration for a metric used in visualizations
 */
export interface MetricConfig {
  metricId: string;
  minValue: number;
  maxValue: number;
  baseline: number;
  name: string;
  type: string;
  labels: Record<string, number>;
  color: string;
}

const METRIC_COLORS = [
  "#4c8cff",
  "#ff6b6b",
  "#1dd1a1",
  "#feca57",
  "#ff9ff3",
  "#8e44ad",
  "#e67e22",
  "#34495e",
];

/**
 * Assign stable colors based on metric index
 */
export function assignMetricColor(index: number): string {
  return METRIC_COLORS[index % METRIC_COLORS.length];
}

/**
 * Build metric configurations from tracking data with stable colors
 * @param trackingData - Array of metric tracking configurations
 * @returns Array of MetricConfig objects
 */
export function buildMetricConfigs(
  trackingData: MetricTracking[],
): MetricConfig[] {
  return trackingData.map((td, index) => ({
    metricId: td.metric.id,
    minValue: td.metric.minValue ?? 0,
    maxValue: td.metric.maxValue ?? 10,
    baseline: td.baseline,
    name: td.metric.name,
    type: td.metric.metricType,
    labels: td.metric.labels,
    color: assignMetricColor(index),
  }));
}

// ============================================================================
// Value Grouping & Aggregation
// ============================================================================

/**
 * Group entry values by date for a specific metric
 * @param entries - Array of entries
 * @param metricId - ID of the metric to filter by
 * @returns Map of date key (YYYY-M-D) to array of EntryValues
 */
// todo: fix this function, and the whole of this class for that matter.
export function groupValuesByDate(
  entries: Entry[],
  metricId: string,
): Map<string, EntryValue[]> {
  const valuesMap = new Map<string, EntryValue[]>();
  entries.forEach((entry) => {
    entry.values.forEach((value) => {
      if (value.metric.id === metricId) {
        const dateKey = `${entry.recordedAt.getFullYear()}-${entry.recordedAt.getMonth()}-${entry.recordedAt.getDate()}`;
        const existing = valuesMap.get(dateKey) || [];
        valuesMap.set(dateKey, [
          ...existing,
          // value
        ]);
      }
    });
  });
  return valuesMap;
}

/**
 * Prepare chart data for a specific month, averaging multiple values per day
 * @param entries - Array of entries
 * @param selectedMonth - Month in YYYY-MM format
 * @returns Array of chart data points with timestamp and metric values
 */
export interface ChartDataPoint {
  timestamp: string;
  [metricId: string]: number | string | null;
}

export function prepareMonthlyChartData(
  entries: Entry[],
  selectedMonth: string,
): ChartDataPoint[] {
  if (!selectedMonth) return [];

  const monthStart = startOfMonth(new Date(selectedMonth + "-01"));
  const monthEnd = endOfMonth(monthStart);

  // Get all metric IDs present in entries
  const metricIds = Array.from(
    new Set(entries.flatMap((e) => e.values.map((v) => v.metricId))),
  );

  // Group by day and metric, collecting all values per day
  const dailyData = new Map<string, Map<string, number[]>>();
  entries.forEach((entry) => {
    if (entry.recordedAt < monthStart || entry.recordedAt > monthEnd) return;

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

  // Generate all days in the month with averaged values
  const chartData: ChartDataPoint[] = [];
  for (
    let d = new Date(monthStart);
    d <= monthEnd;
    d.setDate(d.getDate() + 1)
  ) {
    const dateKey = format(d, "yyyy-MM-dd");
    const metrics = dailyData.get(dateKey);
    const dataPoint: ChartDataPoint = { timestamp: dateKey };
    metricIds.forEach((metricId) => {
      if (metrics && metrics.has(metricId)) {
        const values = metrics.get(metricId)!;
        dataPoint[metricId] = values.reduce((a, b) => a + b, 0) / values.length;
      } else {
        dataPoint[metricId] = null;
      }
    });
    chartData.push(dataPoint);
  }

  return chartData;
}

// ============================================================================
// Color Calculation
// ============================================================================

const NEUTRAL_COLOR = "rgb(167, 243, 208)"; // bg-green-200

/**
 * Calculate color based on metric value - blue for low, red for high values
 * Used for mood visualization: blue (depressed) to red (manic) via white in middle
 * @param value - The metric value
 * @param minValue - Minimum value for the metric
 * @param maxValue - Maximum value for the metric
 * @returns RGB color string
 */
export function getMoodColor(
  value: number,
  minValue: number,
  maxValue: number,
): string {
  // Normalize value to 0-1 range
  const normalized = (value - minValue) / (maxValue - minValue);
  if (value === 0) {
    return NEUTRAL_COLOR;
  }

  // Blue (depressed) to Red (manic) via white in the middle
  if (normalized < 0.5) {
    // Blue to white (0 to 0.5)
    const intensity = normalized * 2; // 0 to 1
    const blueStrength = Math.round(100 + 155 * intensity); // 100 to 255
    const redGreen = Math.round(intensity * 255); // 0 to 255
    return `rgb(${redGreen}, ${redGreen}, ${blueStrength})`;
  } else {
    // White to red (0.5 to 1)
    const intensity = (normalized - 0.5) * 2; // 0 to 1
    const red = 255;
    const greenBlue = Math.round(255 * (1 - intensity)); // 255 to 0
    return `rgb(${red}, ${greenBlue}, ${greenBlue})`;
  }
}
