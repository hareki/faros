ALTER TYPE "public"."activity_type" ADD VALUE 'offer_received' BEFORE 'event_scheduled';--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sub_stages" ADD CONSTRAINT "sub_stages_id_stage_unique" UNIQUE("id","stage");--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_sub_stage_stage_fk" FOREIGN KEY ("sub_stage_id","stage") REFERENCES "public"."sub_stages"("id","stage") ON DELETE no action ON UPDATE no action;