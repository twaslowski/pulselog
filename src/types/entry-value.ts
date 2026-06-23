import { z } from "zod";
import { MetricSchema } from "@/types/metric";
import { entryValue } from "@/db/schemas/schema";
import { createSelectSchema } from "drizzle-zod";

/**
 * Currently there are three types of EntryValue schemas around; see if this can be reduced.
 * RawEntryValueSchema is effectively a datapoint, consisting only of a key-value pair.
 * EntryValueSelectSchema is the schema for the Drizzle table, which includes the metricId and value, but not the metric itself.
 * EntryValueSchema is the schema for the Drizzle table after a successful join on the metric table.
 */

export const RawEntryValueSchema = z.object({
  metricId: z.string(),
  value: z.number(),
});

export const EntryValueSelectSchema = createSelectSchema(entryValue);

export const EntryValueSchema = EntryValueSelectSchema.pick({
  metricId: true,
  value: true,
}).extend({
  metric: MetricSchema,
});

export type RawEntryValue = z.infer<typeof RawEntryValueSchema>;
export type EntryValue = z.infer<typeof EntryValueSelectSchema>;
export type EntryValueWithMetric = z.infer<typeof EntryValueSchema>;
