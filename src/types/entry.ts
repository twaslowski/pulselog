import { z } from "zod";
import { EntryValueWithMetricSchema } from "@/types/entry-value";

const isoDateString = z.iso.datetime({ offset: true });

// The Entry, as it is being used in the application.
// Does not 1:1 correspond to the database schema; the "values" field is an array of entry_value data.
export const EntrySchema = z.object({
  id: z.number(),
  user_id: z.string(),
  recorded_at: isoDateString.pipe(z.coerce.date()),
  comment: z.string(),
  creation_timestamp: isoDateString.pipe(z.coerce.date()),
  updated_timestamp: isoDateString.pipe(z.coerce.date()),
  values: z.array(EntryValueWithMetricSchema),
});

export const CreateEntryInputSchema = z.object({
  recorded_at: isoDateString,
  comment: z.string(),
  values: z.array(
    z.object({
      metric_id: z.string(),
      value: z.number(),
    }),
  ),
});

// Represents the database schema retrieved from Supabase, accounting for the entry_value join column name
export const DBEntrySchema = z
  .object({
    id: z.number(),
    user_id: z.string(),
    comment: z.string(),
    recorded_at: isoDateString.pipe(z.coerce.date()),
    creation_timestamp: isoDateString.pipe(z.coerce.date()),
    updated_timestamp: isoDateString.pipe(z.coerce.date()),
    entry_value: z.array(EntryValueWithMetricSchema),
  })
  .transform(({ entry_value, ...rest }) => ({
    ...rest,
    values: entry_value,
  }));

export type CreateEntryInput = z.infer<typeof CreateEntryInputSchema>;
export type Entry = z.infer<typeof EntrySchema>;
