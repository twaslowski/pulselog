import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  entry: {
    metrics: r.many.metric({
      from: r.entry.id.through(r.entryValue.entryId),
      to: r.metric.id.through(r.entryValue.metricId),
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
  telegramAccounts: {
    usersInAuth: r.one.usersInAuth({
      from: r.telegramAccounts.userId,
      to: r.usersInAuth.id,
    }),
  },
  usersInAuth: {
    telegramAccounts: r.many.telegramAccounts(),
  },
  trackingDefault: {
    metric: r.one.metric({
      from: r.trackingDefault.metricId,
      to: r.metric.id,
    }),
  },
}));
