import { withApiHandler } from "@/lib/api/with-api-handler";
import { NextResponse } from "next/server";
import { db } from "@/db/connect";
import { metric } from "@/db/schemas/schema";
import { eq, or } from "drizzle-orm";
import { MetricCreationSchema } from "@/types/metric";
import { extractBounds } from "@/lib/metric";


export const GET = withApiHandler({}, async ({ profile }) => {
  const metrics = await db
    .select()
    .from(metric)
    .where(or(eq(metric.ownerId, profile.id), eq(metric.ownerId, "SYSTEM")));

  return NextResponse.json(metrics, { status: 200 });
});

export const POST = withApiHandler(
  {
    bodySchema: MetricCreationSchema,
  },
  async ({ profile, body }) => {
    const {
      name,
      description,
      metricType,
      labels,
      minValue,
      maxValue,
    } = body;

    const bounds = extractBounds({
      labels,
      minValue,
      maxValue,
    });

    const inserted = await db
      .insert(metric)
      .values({
        name,
        description,
        metricType,
        labels,
        minValue: bounds.minValue,
        maxValue: bounds.maxValue,
        ownerId: profile.id,
        creationTimestamp: new Date(),
        updateTimestamp: new Date(),
      })
      .returning();

    return NextResponse.json(inserted[0], { status: 201 });
  },
);