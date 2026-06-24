import { z } from "zod";
import { EntryValueSchema, RawEntryValueSchema } from "@/types/entry-value";
import { entry } from "@/db/schemas/schema";
import { createSelectSchema } from "drizzle-zod";

const isoDateString = z.iso.datetime({ offset: true });

export const EntrySelectSchema = createSelectSchema(entry);
export const EntrySchema = EntrySelectSchema.extend({
  values: z.array(EntryValueSchema),
});

export const CreateEntryInputSchema = z.object({
  recordedAt: isoDateString.pipe(z.coerce.date()),
  comment: z.string(),
  values: z.array(RawEntryValueSchema),
});

export type CreateEntryInput = z.infer<typeof CreateEntryInputSchema>;
export type Entry = z.infer<typeof EntrySchema>;
