import { withApiHandler } from "@/lib/api/with-api-handler";
import { CreateEntryInputSchema } from "@/types/entry";
import { NextResponse } from "next/server";
import { db } from "@/db/connect";
import { entry, entryValue } from "@/db/schemas/schema";
import { takeUniqueOrThrow } from "@/db/util";
import { eq } from "drizzle-orm";

export const POST = withApiHandler(
  {
    bodySchema: CreateEntryInputSchema,
  },
  async ({ profile, body }) => {
    const { recordedAt, comment, values } = body;

    const entryId = await db
      .insert(entry)
      .values({
        userId: profile.id,
        recordedAt: recordedAt,
        comment: comment,
      })
      .returning()
      .then((entry) => takeUniqueOrThrow(entry).id);

    values.forEach((v) => {
      db.insert(entryValue).values({
        entryId: entryId,
        metricId: v.metricId,
        value: v.value,
      });
    });

    return NextResponse.json(
      {
        id: entryId,
      },
      { status: 201 },
    );
  },
);

export const GET = withApiHandler({}, async ({ profile }) => {
  const entries = await db.query.entry.findMany({
    where: { userId: profile.id },
    with: { entryValues: true },
  });

  console.log("entries", entries);

  return NextResponse.json(entries, { status: 200 });
});
