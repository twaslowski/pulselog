import { z } from "zod";
import { metric } from "@/db/schemas/schema";
import { createSelectSchema } from "drizzle-zod";

const MetricType = z.enum(["discrete", "continuous", "event"]);

export const MetricSchema = createSelectSchema(metric);

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

export type MetricType = z.infer<typeof MetricType>;
export type Metric = z.infer<typeof MetricSchema>;
