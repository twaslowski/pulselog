import { withApiHandler } from "@/lib/api/with-api-handler";
import { NextResponse } from "next/server";
import { db } from "@/db/connect";
import { metricTracking } from "@/db/schemas/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const TrackingIdParamSchema = z.object({
  metricId: z.uuid(),
});

const UpdateBaselineSchema = z.object({
  baseline: z.number(),
});

export const DELETE = withApiHandler(
  {
    paramsSchema: TrackingIdParamSchema,
  },
  async ({ profile, params }) => {
    const deleted = await db
      .delete(metricTracking)
      .where(
        and(
          eq(metricTracking.metricId, params.metricId),
          eq(metricTracking.userId, profile.id),
        ),
      )
      .returning({ metricId: metricTracking.metricId });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Metric tracking not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  },
);

export const PATCH = withApiHandler(
  {
    paramsSchema: TrackingIdParamSchema,
    bodySchema: UpdateBaselineSchema,
  },
  async ({ profile, params, body }) => {
    const updated = await db
      .update(metricTracking)
      .set({ baseline: body.baseline })
      .where(
        and(
          eq(metricTracking.metricId, params.metricId),
          eq(metricTracking.userId, profile.id),
        ),
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Metric tracking not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  },
);
