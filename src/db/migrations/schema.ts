import {
  bigint,
  boolean,
  index,
  jsonb,
  numeric,
  pgPolicy,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const entry = pgTable.withRLS(
  "entry",
  {
    id: serial().primaryKey(),
    userId: varchar("user_id", { length: 255 }),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    creationTimestamp: timestamp("creation_timestamp", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedTimestamp: timestamp("updated_timestamp", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    comment: text(),
  },
  (table) => [
    pgPolicy("own_entries", {
      to: ["authenticated"],
      using: sql`(((( SELECT auth.uid() AS uid))::character varying IS NOT NULL) AND (((( SELECT auth.uid() AS uid))::character varying)::text = (user_id)::text))`,
      withCheck: sql`(((( SELECT auth.uid() AS uid))::character varying IS NOT NULL) AND (((( SELECT auth.uid() AS uid))::character varying)::text = (user_id)::text))`,
    }),
  ],
);

export const entryValue = pgTable.withRLS(
  "entry_value",
  {
    entryId: bigint("entry_id", { mode: "number" })
      .notNull()
      .references(() => entry.id, { onDelete: "cascade" }),
    metricId: uuid("metric_id")
      .notNull()
      .references(() => metric.id, { onDelete: "cascade" }),
    value: numeric().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.entryId, table.metricId],
      name: "entry_value_pkey",
    }),
    index("idx_entry_value_metric_id").using(
      "btree",
      table.metricId.asc().nullsLast(),
    ),

    pgPolicy("own_entry_values", {
      to: ["authenticated"],
      using: sql`((( SELECT auth.uid() AS uid) IS NOT NULL) AND (entry_id IN ( SELECT entry.id
   FROM entry
  WHERE ((entry.user_id)::text = ((( SELECT auth.uid() AS uid))::character varying)::text))))`,
      withCheck: sql`((( SELECT auth.uid() AS uid) IS NOT NULL) AND (entry_id IN ( SELECT entry.id
   FROM entry
  WHERE ((entry.user_id)::text = ((( SELECT auth.uid() AS uid))::character varying)::text))))`,
    }),
  ],
);

export const metric = pgTable.withRLS(
  "metric",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
    labels: jsonb(),
    ownerId: varchar("owner_id", { length: 36 }).default("SYSTEM").notNull(),
    creationTimestamp: timestamp("creation_timestamp", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updateTimestamp: timestamp("update_timestamp", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    metricType: varchar("metric_type", { length: 50 }).notNull(),
    minValue: numeric("min_value").notNull(),
    maxValue: numeric("max_value").notNull(),
  },
  (table) => [
    index("idx_metric_owner_id").using(
      "btree",
      table.ownerId.asc().nullsLast(),
    ),
    unique("uq_metric_name_user_id").on(table.name, table.ownerId),
    pgPolicy("insert_own_metrics", {
      to: ["authenticated"],
      using: sql`(((( SELECT auth.uid() AS uid))::character varying IS NOT NULL) AND (((auth.uid())::character varying)::text = (owner_id)::text))`,
      withCheck: sql`((( SELECT (auth.uid())::character varying AS uid))::text = (owner_id)::text)`,
    }),

    pgPolicy("select_system_metrics", {
      for: "select",
      using: sql`((owner_id)::text = 'SYSTEM'::text)`,
    }),
  ],
);

export const metricTracking = pgTable.withRLS(
  "metric_tracking",
  {
    userId: varchar("user_id", { length: 255 }).notNull(),
    metricId: uuid("metric_id")
      .notNull()
      .references(() => metric.id, { onDelete: "cascade" }),
    baseline: numeric().notNull(),
    trackedAt: timestamp("tracked_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.metricId],
      name: "metric_tracking_pkey",
    }),
    index("idx_metric_tracking_metric_id").using(
      "btree",
      table.metricId.asc().nullsLast(),
    ),
    index("idx_metric_tracking_user_id").using(
      "btree",
      table.userId.asc().nullsLast(),
    ),

    pgPolicy("own_metric_tracking", {
      to: ["authenticated"],
      using: sql`(((( SELECT auth.uid() AS uid))::character varying IS NOT NULL) AND (((( SELECT auth.uid() AS uid))::character varying)::text = (user_id)::text))`,
      withCheck: sql`(((( SELECT auth.uid() AS uid))::character varying IS NOT NULL) AND (((( SELECT auth.uid() AS uid))::character varying)::text = (user_id)::text))`,
    }),
  ],
);

export const telegramAccounts = pgTable.withRLS(
  "telegram_accounts",
  {
    telegramId: bigint("telegram_id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    telegramUsername: text("telegram_username"),
    linkedAt: timestamp("linked_at", { withTimezone: true }).default(
      sql`now()`,
    ),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_telegram_accounts_user_id").using(
      "btree",
      table.userId.asc().nullsLast(),
    ),
    unique("telegram_accounts_user_id_key").on(table.userId),
    pgPolicy("own_telegram_account", {
      using: sql`(( SELECT auth.uid() AS uid) = user_id)`,
    }),
  ],
);

export const trackingDefault = pgTable.withRLS(
  "tracking_default",
  {
    metricId: uuid("metric_id")
      .primaryKey()
      .references(() => metric.id, { onDelete: "cascade" }),
    baseline: numeric().notNull(),
  },
  (table) => [
    pgPolicy("select_tracking_defaults", {
      for: "select",
      to: ["anon", "authenticated"],
      using: sql`true`,
    }),
  ],
);

export const verificationCodes = pgTable.withRLS(
  "verification_codes",
  {
    id: uuid().defaultRandom().primaryKey(),
    telegramId: bigint("telegram_id", { mode: "number" }).notNull(),
    code: text().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    used: boolean().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`,
    ),
    telegramUsername: text("telegram_username"),
  },
  (table) => [
    index("idx_verification_codes_expires_at").using(
      "btree",
      table.expiresAt.asc().nullsLast(),
    ),
    index("idx_verification_codes_telegram_id").using(
      "btree",
      table.telegramId.asc().nullsLast(),
    ),
  ],
);
