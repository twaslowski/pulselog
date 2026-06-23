ALTER TABLE "profile" RENAME CONSTRAINT "profiles_id_fkey" TO "profile_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "entry_value" ALTER COLUMN "value" SET DATA TYPE integer USING "value"::integer;--> statement-breakpoint
ALTER TABLE "metric" ALTER COLUMN "min_value" SET DATA TYPE integer USING "min_value"::integer;--> statement-breakpoint
ALTER TABLE "metric" ALTER COLUMN "max_value" SET DATA TYPE integer USING "max_value"::integer;--> statement-breakpoint
ALTER TABLE "metric_tracking" ALTER COLUMN "baseline" SET DATA TYPE integer USING "baseline"::integer;--> statement-breakpoint
ALTER TABLE "tracking_default" ALTER COLUMN "baseline" SET DATA TYPE integer USING "baseline"::integer;