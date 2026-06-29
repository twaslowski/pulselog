import { withApiHandler, IdParamSchema } from "@/lib/api/with-api-handler";
import { NextResponse } from "next/server";
import { db } from "@/db/connect";
import { entry, entryValue } from "@/db/schemas/schema";
import { and, eq } from "drizzle-orm";
import { CreateEntryInputSchema } from "@/types/entry";

export const PUT = withApiHandler(
  {
    paramsSchema: IdParamSchema,
    bodySchema: CreateEntryInputSchema,
  },
  async ({ profile, params, body }) => {
    const entryId = params.id;
    const { recordedAt, comment, values } = body;

    const updatedEntries = await db
      .update(entry)
      .set({ recordedAt, comment })
      .where(and(eq(entry.id, entryId), eq(entry.userId, profile.id)))
      .returning();

    if (updatedEntries.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    if (values.length > 0) {
      await db.delete(entryValue).where(eq(entryValue.entryId, entryId));
      await db.insert(entryValue).values(
        values.map((value) => ({
          entryId,
          metricId: value.metricId,
          value: value.value,
        })),
      );
    }

    return NextResponse.json({ id: entryId }, { status: 200 });
  },
);

export const DELETE = withApiHandler(
  {
    paramsSchema: IdParamSchema,
  },
  async ({ profile, params }) => {
    const deletedEntries = await db
      .delete(entry)
      .where(and(eq(entry.id, params.id), eq(entry.userId, profile.id)))
      .returning({ id: entry.id });

    if (deletedEntries.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  },
);
