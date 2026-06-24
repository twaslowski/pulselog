import { withApiHandler } from "@/lib/api/with-api-handler";
import { NextResponse } from "next/server";
import { db } from "@/db/connect";

export const GET = withApiHandler({}, async ({ profile }) => {
  const trackedMetrics = await db.query.metricTracking.findMany({
    columns: { userId: true, trackedAt: true, baseline: true },
    where: { userId: profile.id },
    with: { metric: true },
  });

  return NextResponse.json(trackedMetrics, { status: 200 });
});
