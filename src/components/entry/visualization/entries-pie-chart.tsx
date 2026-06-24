"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Entry } from "@/types/entry";
import { MetricTracking } from "@/types/tracking";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getMoodColor } from "@/lib/visualization-utils";

interface PieChartProps {
  entries: Entry[];
  trackingData: MetricTracking[];
  startDate: Date;
  endDate: Date;
}

interface PieDataPoint {
  name: string;
  value: number;
  percentage: number;
  numericValue: number; // Store the original numeric value for color calculation
  [key: string]: string | number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PieDataPoint;
  }>;
}

export default function EntriesPieChart({
  entries,
  trackingData,
  startDate,
  endDate,
}: PieChartProps) {
  // Initialize with first metric if available
  const [selectedMetricId, setSelectedMetricId] = useState<string>(
    trackingData[0]?.metric.id || "",
  );

  // Update selected metric when tracking data changes
  useEffect(() => {
    if (trackingData.length > 0 && !selectedMetricId) {
      setSelectedMetricId(trackingData[0].metric.id);
    }
  }, [trackingData, selectedMetricId]);

  // Get the selected metric configuration
  const selectedMetric = useMemo(() => {
    return trackingData.find((td) => td.metric.id === selectedMetricId);
  }, [trackingData, selectedMetricId]);

  // Prepare pie chart data - count occurrences of each value
  const pieData = useMemo<PieDataPoint[]>(() => {
    if (!selectedMetric) return [];

    // Filter entries within the date range
    const filteredEntries = entries.filter(
      (entry) => entry.recordedAt >= startDate && entry.recordedAt <= endDate,
    );

    // Count occurrences of each value
    const valueCounts = new Map<number, number>();
    let totalCount = 0;

    filteredEntries.forEach((entry) => {
      entry.values.forEach((value) => {
        if (value.metricId === selectedMetricId) {
          const currentCount = valueCounts.get(value.value) || 0;
          valueCounts.set(value.value, currentCount + 1);
          totalCount++;
        }
      });
    });

    if (totalCount === 0) return [];

    // For discrete metrics, use labels; for continuous, round to reasonable precision
    const isDiscrete = selectedMetric.metric.metricType === "discrete";
    const labels = selectedMetric.metric.labels;

    const data: PieDataPoint[] = Array.from(valueCounts.entries())
      .map(([value, count]) => {
        let name: string;
        if (isDiscrete && labels) {
          // Find the label for this value
          const labelEntry = Object.entries(labels).find(
            ([, val]) => val === value,
          );
          name = labelEntry ? labelEntry[0] : value.toFixed(1);
        } else {
          name = value.toString();
        }

        return {
          name,
          value: count,
          percentage: (count / totalCount) * 100,
          numericValue: value,
        };
      })
      .sort((a, b) => b.value - a.value); // Sort by count descending

    return data;
  }, [entries, selectedMetricId, selectedMetric, startDate, endDate]);

  // Custom label renderer for pie chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = useCallback((entry: any) => {
    const percentage = entry.percentage.toFixed(1);
    return `${entry.name} (${percentage}%)`;
  }, []);

  // Custom tooltip
  const CustomTooltip = useCallback(({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            padding: "10px",
            color: "white",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>{data.name}</p>
          <p style={{ margin: "5px 0 0 0" }}>Count: {data.value}</p>
          <p style={{ margin: "5px 0 0 0" }}>
            Percentage: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  }, []);

  return (
    <div className="w-full">
      {/* Metric Selector */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="text-sm font-medium">Select Metric:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {selectedMetric?.metric.name || "Select a metric"}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {trackingData.map((td) => (
              <DropdownMenuItem
                key={td.metric.id}
                onClick={() => setSelectedMetricId(td.metric.id)}
                className="cursor-pointer"
              >
                {td.metric.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Pie Chart */}
      <div
        className="w-full rounded-lg p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      >
        {pieData.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p>No data available for {selectedMetric?.metric.name}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getMoodColor(
                      entry.numericValue,
                      selectedMetric?.metric.minValue ?? 0,
                      selectedMetric?.metric.maxValue ?? 10,
                    )}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  color: "rgba(255, 255, 255, 0.7)",
                }}
                formatter={(value) => (
                  <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Statistics */}
      {pieData.length > 0 && (
        <div className="mt-4 text-center text-sm">
          Total entries: {pieData.reduce((sum, d) => sum + d.value, 0)} | Unique
          values: {pieData.length}
        </div>
      )}
    </div>
  );
}
