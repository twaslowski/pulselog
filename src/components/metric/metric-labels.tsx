import {
  deriveHumanReadableMetricType,
  Metric,
  MetricType,
} from "@/types/metric";
import { Badge } from "@/components/ui/badge";
import React from "react";

interface MetricLabelProps {
  metric: Metric;
}

const getMetricTypeClass = (metricType: MetricType) => {
  switch (metricType) {
    case "discrete":
      return "badge-metric-discrete";
    case "event":
      return "badge-metric-event";
    case "continuous":
      return "badge-metric-continuous";
    default:
      return "";
  }
};

const getOwnerLabel = (ownerId: string) => {
  return ownerId === "SYSTEM" ? "🤖 System" : "👤 Yours";
};

const getOwnerClass = (ownerId: string) => {
  return ownerId === "SYSTEM" ? "badge-owner-system" : "badge-owner-user";
};

export const MetricLabels: React.FC<MetricLabelProps> = ({ metric }) => {
  return (
    <>
      <Badge
        variant="outline"
        className={getMetricTypeClass(metric.metricType)}
      >
        {deriveHumanReadableMetricType(metric.metricType)}
      </Badge>
      <Badge variant="outline" className={getOwnerClass(metric.ownerId)}>
        {getOwnerLabel(metric.ownerId)}
      </Badge>
    </>
  );
};
