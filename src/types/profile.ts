import { createSelectSchema } from "drizzle-zod";
import { profile } from "@/db/schemas/schema";
import { z } from "zod";

const ProfileSchema = createSelectSchema(profile);
export type Profile = z.infer<typeof ProfileSchema>;
