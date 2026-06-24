import { z } from "zod";
import { metric } from "@/db/schemas/schema";
import { createSelectSchema } from "drizzle-zod";

const MetricTypeSchema = z.enum(["discrete", "continuous", "event"]);

export const MetricSchema = createSelectSchema(metric)
  .extend({
    metricType: MetricTypeSchema,
  });

export const deriveHumanReadableMetricType = (metricType: MetricType) => {
  switch (metricType) {
    case "discrete":
      return "🎨 Vibe";
    case "continuous":
      return "🔢 Measurement";
    case "event":
      return "⭐ Moment";
  }
};

export type MetricType = z.infer<typeof MetricTypeSchema>;
export type Metric = z.infer<typeof MetricSchema>;
