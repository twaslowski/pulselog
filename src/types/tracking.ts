import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { metricTracking } from "@/db/schemas/schema";
import { MetricSchema } from "@/types/metric";

export const MetricTrackingSelectSchema = createSelectSchema(metricTracking)
  .extend({
    baseline: z.coerce.number()
  });

export const MetricTrackingSchema = MetricTrackingSelectSchema.pick({
  userId: true,
  trackedAt: true,
  baseline: true,
}).extend({
  metric: MetricSchema,
});

export type MetricTracking = z.infer<typeof MetricTrackingSchema>;
