import { z } from "zod";
import { trackingDefault } from "@/db/schemas/schema";
import { createSelectSchema } from "drizzle-zod";

export const TrackingDefaultSchema = createSelectSchema(trackingDefault);

export type Default = z.infer<typeof TrackingDefaultSchema>;
