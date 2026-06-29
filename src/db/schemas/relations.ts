import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  entry: {
    metrics: r.many.metric({
      from: r.entry.id.through(r.entryValue.entryId),
      to: r.metric.id.through(r.entryValue.metricId),
    }),
    values: r.many.entryValue({
      from: r.entry.id,
      to: r.entryValue.entryId,
    }),
  },
  metric: {
    entries: r.many.entry(),
    metricTrackings: r.many.metricTracking(),
    trackingDefaults: r.many.trackingDefault(),
  },
  metricTracking: {
    metric: r.one.metric({
      from: r.metricTracking.metricId,
      to: r.metric.id,
    }),
  },
  trackingDefault: {
    metric: r.one.metric({
      from: r.trackingDefault.metricId,
      to: r.metric.id,
    }),
  },
  entryValue: {
    entry: r.one.entry({
      from: r.entryValue.entryId,
      to: r.entry.id,
    }),
    metric: r.one.metric({
      from: r.entryValue.metricId,
      to: r.metric.id,
    }),
  },
}));
