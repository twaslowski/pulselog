import { z } from "zod";
import { MetricSchema } from "@/types/metric";

export const EntryValueSchema = z.object({
  value: z.number(),
  metricId: z.string(),
});

export const EntryValueWithMetricSchema = EntryValueSchema.extend({
  metric: MetricSchema,
});

export type EntryValue = z.infer<typeof EntryValueSchema>;
export type EntryValueWithMetric = z.infer<typeof EntryValueWithMetricSchema>;
