CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
CREATE POLICY "owned entity access" ON "profile" AS PERMISSIVE FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = id));