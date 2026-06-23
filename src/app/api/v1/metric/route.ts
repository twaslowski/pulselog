import { withApiHandler } from "@/lib/api/with-api-handler";
import { CreateEntryInputSchema } from "@/types/entry";
import { NextResponse } from "next/server";
import { db } from "@/db/connect";
import { entry, entryValue, metric } from "@/db/schemas/schema";
import { takeUniqueOrThrow } from "@/db/util";
import { eq, or } from "drizzle-orm";

export const GET = withApiHandler({}, async ({ profile }) => {
  const metrics = await db
    .select()
    .from(metric)
    .where(or(eq(metric.ownerId, profile.id), eq(metric.ownerId, "SYSTEM")));

  return NextResponse.json(metrics, { status: 200 });
});
