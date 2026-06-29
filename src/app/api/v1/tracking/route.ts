import { withApiHandler } from "@/lib/api/with-api-handler";
import { NextResponse } from "next/server";
import { db } from "@/db/connect";
import { metricTracking } from "@/db/schemas/schema";
import { z } from "zod";

const TrackingCreateSchema = z.object({
  metricId: z.uuid(),
  baseline: z.number().default(0),
});

export const GET = withApiHandler({}, async ({ profile }) => {
  const trackedMetrics = await db.query.metricTracking.findMany({
    columns: { userId: true, trackedAt: true, baseline: true },
    where: { userId: profile.id },
    with: { metric: true },
  });

  return NextResponse.json(trackedMetrics, { status: 200 });
});

export const POST = withApiHandler(
  {
    bodySchema: TrackingCreateSchema,
  },
  async ({ profile, body }) => {
    const { metricId, baseline } = body;

    await db.insert(metricTracking).values({
      userId: profile.id,
      metricId,
      baseline,
      trackedAt: new Date(),
    });

    return new NextResponse(null, { status: 201 });
  },
);