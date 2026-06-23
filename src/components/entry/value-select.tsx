import { Metric } from "@/types/metric";
import { range } from "@/lib/utils";
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon } from "lucide-react";
import React from "react";

interface ValueSelectProps {
  metric: Metric;
  baseline: number;
  handleChange: (metricId: string, value: number) => void;
}

function getMetricOptions(metric: Metric): { label: string; value: number }[] {
  if (metric.metricType === "discrete") {
    if (!metric.labels) return [];
    return Object.entries(metric.labels)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));
  }
  if (metric.metricType === "event") {
    return [
      { label: "Happened", value: 1 },
      { label: "Didn't happen", value: 0 },
    ];
  }
  // continuous metric
  if (
    metric.minValue !== null &&
    metric.maxValue !== null &&
    metric.minValue <= metric.maxValue
  ) {
    return range(metric.minValue, metric.maxValue).map((v) => ({
      label: String(v),
      value: v,
    }));
  }
  return [];
}

export default function ValueSelect({
  metric,
  baseline,
  handleChange,
}: ValueSelectProps) {
  const options = getMetricOptions(metric);

  return (
    <Select.Root
      value={baseline !== undefined ? String(baseline) : undefined}
      onValueChange={(val) => handleChange(metric.id, Number(val))}
    >
      <Select.Trigger
        className="inline-flex items-center justify-between rounded-md border border-primary/50 px-3 py-1 w-full"
        aria-label={`select-${metric.name}`}
      >
        <Select.Value placeholder={`Select ${metric.name}`} />
        <Select.Icon>
          <ChevronDownIcon className="h-4 w-4 opacity-70" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md z-[100]">
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={String(opt.value)}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
              >
                <Select.ItemText>
                  <span>{opt.label}</span>
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
