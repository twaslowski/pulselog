"use client";

import React from "react";
import { type Metric } from "@/types/metric";
import { cn, range } from "@/lib/utils";

interface MetricInputProps {
  metric: Metric;
  baseline: number;
  onMetricSelect: (metricId: string, value: number) => void;
}

export default function MetricInput({
  metric,
  baseline,
  onMetricSelect,
}: MetricInputProps) {
  const baselineStyling = (value: number, baseline: number): string => {
    return value === baseline ? "border-blue-300/10 bg-blue-300/10" : "";
  };

  const renderDiscreteInput = () => {
    if (!metric.labels || Object.keys(metric.labels).length === 0) {
      throw new Error("Discrete metrics must have labels defined.");
    }

    return (
      <>
        {Object.entries(metric.labels)
          // order by values descending
          .sort((a, b) => b[1] - a[1])
          .map(([label, value]) => (
            <div
              key={value}
              className={cn(
                `flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all`,
                baselineStyling(value, baseline),
              )}
              onClick={() => onMetricSelect(metric.id, value)}
            >
              <button aria-label={`select-${metric.name}-value-${label}`}>
                <p>{label}</p>
              </button>
            </div>
          ))}
      </>
    );
  };

  const renderContinuousInput = () => {
    if (metric.minValue === null || metric.maxValue === null) {
      throw new Error(
        "Continuous metrics must have min and max values defined.",
      );
    }

    return range(metric.minValue, metric.maxValue).map((value) => (
      <div
        key={value}
        onClick={() => onMetricSelect(metric.id, value)}
        className={cn(
          `flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all`,
          baselineStyling(value, baseline),
        )}
      >
        <button>
          <p>{value}</p>
        </button>
      </div>
    ));
  };

  return (
    <div className="mb-8 space-y-3 border border-primary-foreground rounded-lg p-4">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
        {metric.name}
      </label>
      {metric.metricType === "discrete"
        ? renderDiscreteInput()
        : renderContinuousInput()}
    </div>
  );
}
