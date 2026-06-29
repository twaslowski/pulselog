import { withApiHandler } from "@/lib/api/with-api-handler";
import { NextResponse } from "next/server";
import { db } from "@/db/connect";
import { metric } from "@/db/schemas/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { MetricCreationSchema } from "@/types/metric";
import { extractBounds } from "@/lib/metric";

const MetricIdParamSchema = z.object({
  id: z.uuid(),
});

export const PUT = withApiHandler(
  {
    paramsSchema: MetricIdParamSchema,
    bodySchema: MetricCreationSchema,
  },
  async ({ profile, params, body }) => {
    const { name, description, minValue, maxValue, labels, metricType } = body;
    const bounds = extractBounds({ labels, minValue, maxValue });

    const updated = await db
      .update(metric)
      .set({
        name,
        description,
        metricType,
        labels,
        minValue: bounds.minValue,
        maxValue: bounds.maxValue,
        updateTimestamp: new Date(),
      })
      .where(and(eq(metric.id, params.id), eq(metric.ownerId, profile.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Metric not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  },
);

export const DELETE = withApiHandler(
  {
    paramsSchema: MetricIdParamSchema,
  },
  async ({ profile, params }) => {
    const deleted = await db
      .delete(metric)
      .where(and(eq(metric.id, params.id), eq(metric.ownerId, profile.id)))
      .returning({ id: metric.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Metric not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  },
);
