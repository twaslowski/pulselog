-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
CREATE TABLE "entry" (
	"id" serial PRIMARY KEY,
	"user_id" varchar(255),
	"recorded_at" timestamp with time zone NOT NULL,
	"creation_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"comment" text
);

ALTER TABLE "entry" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "entry_value" (
	"entry_id" bigint,
	"metric_id" uuid,
	"value" numeric NOT NULL,
	CONSTRAINT "entry_value_pkey" PRIMARY KEY("entry_id","metric_id")
);

ALTER TABLE "entry_value" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "metric" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"labels" jsonb,
	"owner_id" varchar(36) DEFAULT 'SYSTEM' NOT NULL,
	"creation_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"update_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"metric_type" varchar(50) NOT NULL,
	"min_value" numeric NOT NULL,
	"max_value" numeric NOT NULL,
	CONSTRAINT "uq_metric_name_user_id" UNIQUE("name","owner_id")
);

ALTER TABLE "metric" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "metric_tracking" (
	"user_id" varchar(255),
	"metric_id" uuid,
	"baseline" numeric NOT NULL,
	"tracked_at" timestamp with time zone NOT NULL,
	CONSTRAINT "metric_tracking_pkey" PRIMARY KEY("user_id","metric_id")
);

ALTER TABLE "metric_tracking" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "telegram_accounts" (
	"telegram_id" bigint PRIMARY KEY,
	"user_id" uuid NOT NULL CONSTRAINT "telegram_accounts_user_id_key" UNIQUE,
	"telegram_username" text,
	"linked_at" timestamp with time zone DEFAULT now(),
	"last_login_at" timestamp with time zone
);

ALTER TABLE "telegram_accounts" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "tracking_default" (
	"metric_id" uuid PRIMARY KEY,
	"baseline" numeric NOT NULL
);

ALTER TABLE "tracking_default" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "verification_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"telegram_id" bigint NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"telegram_username" text
);

ALTER TABLE "verification_codes" ENABLE ROW LEVEL SECURITY;
CREATE INDEX "idx_entry_value_metric_id" ON "entry_value" ("metric_id");
CREATE INDEX "idx_metric_owner_id" ON "metric" ("owner_id");
CREATE INDEX "idx_metric_tracking_metric_id" ON "metric_tracking" ("metric_id");
CREATE INDEX "idx_metric_tracking_user_id" ON "metric_tracking" ("user_id");
CREATE INDEX "idx_telegram_accounts_user_id" ON "telegram_accounts" ("user_id");
CREATE INDEX "idx_verification_codes_expires_at" ON "verification_codes" ("expires_at");
CREATE INDEX "idx_verification_codes_telegram_id" ON "verification_codes" ("telegram_id");
ALTER TABLE "entry_value" ADD CONSTRAINT "entry_value_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entry"("id") ON DELETE CASCADE;
ALTER TABLE "entry_value" ADD CONSTRAINT "entry_value_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metric"("id") ON DELETE CASCADE;
ALTER TABLE "metric_tracking" ADD CONSTRAINT "metric_tracking_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metric"("id") ON DELETE CASCADE;
ALTER TABLE "tracking_default" ADD CONSTRAINT "tracking_default_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metric"("id") ON DELETE CASCADE;
ALTER TABLE "telegram_accounts" ADD CONSTRAINT "telegram_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
CREATE POLICY "own_entries" ON "entry" AS PERMISSIVE FOR ALL TO "authenticated" USING ((((( SELECT auth.uid() AS uid))::character varying IS NOT NULL) AND (((( SELECT auth.uid() AS uid))::character varying)::text = (user_id)::text))) WITH CHECK ((((( SELECT auth.uid() AS uid))::character varying IS NOT NULL) AND (((( SELECT auth.uid() AS uid))::character varying)::text = (user_id)::text)));
CREATE POLICY "own_entry_values" ON "entry_value" AS PERMISSIVE FOR ALL TO "authenticated" USING (((( SELECT auth.uid() AS uid) IS NOT NULL) AND (entry_id IN ( SELECT entry.id
   FROM entry
  WHERE ((entry.user_id)::text = ((( SELECT auth.uid() AS uid))::character varying)::text))))) WITH CHECK (((( SELECT auth.uid() AS uid) IS NOT NULL) AND (entry_id IN ( SELECT entry.id
   FROM entry
  WHERE ((entry.user_id)::text = ((( SELECT auth.uid() AS uid))::character varying)::text)))));
CREATE POLICY "insert_own_metrics" ON "metric" AS PERMISSIVE FOR ALL TO "authenticated" USING ((((( SELECT auth.uid() AS uid))::character varying IS NOT NULL) AND (((auth.uid())::character varying)::text = (owner_id)::text))) WITH CHECK (((( SELECT (auth.uid())::character varying AS uid))::text = (owner_id)::text));
CREATE POLICY "select_system_metrics" ON "metric" AS PERMISSIVE FOR SELECT TO public USING (((owner_id)::text = 'SYSTEM'::text));
CREATE POLICY "own_metric_tracking" ON "metric_tracking" AS PERMISSIVE FOR ALL TO "authenticated" USING ((((( SELECT auth.uid() AS uid))::character varying IS NOT NULL) AND (((( SELECT auth.uid() AS uid))::character varying)::text = (user_id)::text))) WITH CHECK ((((( SELECT auth.uid() AS uid))::character varying IS NOT NULL) AND (((( SELECT auth.uid() AS uid))::character varying)::text = (user_id)::text)));
CREATE POLICY "own_telegram_account" ON "telegram_accounts" AS PERMISSIVE FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "select_tracking_defaults" ON "tracking_default" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);