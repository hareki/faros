CREATE TYPE "public"."activity_type" AS ENUM('created', 'stage_change', 'sub_stage_change', 'note_added', 'response_received', 'event_scheduled', 'event_completed', 'event_cancelled', 'resume_changed', 'closed');--> statement-breakpoint
CREATE TYPE "public"."application_source" AS ENUM('linkedin', 'itviec', 'referral', 'direct', 'recruiter', 'other');--> statement-breakpoint
CREATE TYPE "public"."board_stage" AS ENUM('applied', 'active', 'final_stages', 'closed');--> statement-breakpoint
CREATE TYPE "public"."closed_outcome" AS ENUM('rejected', 'withdrawn', 'accepted', 'ghosted');--> statement-breakpoint
CREATE TYPE "public"."working_model" AS ENUM('remote', 'hybrid', 'onsite');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('scheduled', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('hr_screen', 'tech_screen', 'onsite', 'take_home_due', 'offer_deadline', 'other');--> statement-breakpoint
CREATE TYPE "public"."job_hunt_status" AS ENUM('active', 'ended');--> statement-breakpoint
CREATE TYPE "public"."resume_scope" AS ENUM('library', 'application');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('unread', 'read', 'snoozed', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."rule_kind" AS ENUM('condition', 'time_based');--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"type" "activity_type" NOT NULL,
	"description" text,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_tags" (
	"application_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "application_tags_application_id_tag_id_pk" PRIMARY KEY("application_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_hunt_id" uuid NOT NULL,
	"company" varchar NOT NULL,
	"role" varchar NOT NULL,
	"stage" "board_stage" DEFAULT 'applied' NOT NULL,
	"sub_stage_id" uuid,
	"source" "application_source",
	"jd_url" varchar,
	"jd_text" text,
	"location" varchar,
	"working_model" "working_model",
	"salary_min" integer,
	"salary_max" integer,
	"salary_currency" varchar,
	"notes" text,
	"resume_id" uuid,
	"closed_outcome" "closed_outcome",
	"closed_at" timestamp with time zone,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_closed_state" CHECK (("applications"."stage" = 'closed' AND "applications"."closed_outcome" IS NOT NULL AND "applications"."closed_at" IS NOT NULL)
       OR ("applications"."stage" <> 'closed' AND "applications"."closed_outcome" IS NULL AND "applications"."closed_at" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "sub_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"stage" "board_stage" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"color" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" varchar,
	"id_token" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" varchar NOT NULL,
	"image" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar NOT NULL,
	"value" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"type" "event_type" NOT NULL,
	"title" varchar,
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer,
	"location" varchar,
	"notes" text,
	"status" "event_status" DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_hunts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"status" "job_hunt_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"scope" "resume_scope" NOT NULL,
	"application_id" uuid,
	"file_url" varchar NOT NULL,
	"file_size_bytes" bigint,
	"mime_type" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resumes_scope_app_id" CHECK (("resumes"."scope" = 'library' AND "resumes"."application_id" IS NULL)
       OR ("resumes"."scope" = 'application' AND "resumes"."application_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "notification_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"kind" "rule_kind" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"trigger_config" jsonb NOT NULL,
	"action_config" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"rule_id" uuid,
	"application_id" uuid,
	"event_id" uuid,
	"title" varchar NOT NULL,
	"content" text,
	"status" "notification_status" DEFAULT 'unread' NOT NULL,
	"snoozed_until" timestamp with time zone,
	"dedup_key" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_notification_prefs" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"email_digest_enabled" boolean DEFAULT false NOT NULL,
	"email_digest_cadence" varchar,
	"quiet_hours_start" time,
	"quiet_hours_end" time,
	"timezone" varchar
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_tags" ADD CONSTRAINT "application_tags_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_tags" ADD CONSTRAINT "application_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_hunt_id_job_hunts_id_fk" FOREIGN KEY ("job_hunt_id") REFERENCES "public"."job_hunts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_sub_stage_id_sub_stages_id_fk" FOREIGN KEY ("sub_stage_id") REFERENCES "public"."sub_stages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_stages" ADD CONSTRAINT "sub_stages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_hunts" ADD CONSTRAINT "job_hunts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_rules" ADD CONSTRAINT "notification_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_rule_id_notification_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."notification_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_prefs" ADD CONSTRAINT "user_notification_prefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_log_application_occurred_idx" ON "activity_log" USING btree ("application_id","occurred_at");--> statement-breakpoint
CREATE INDEX "applications_job_hunt_id_idx" ON "applications" USING btree ("job_hunt_id");--> statement-breakpoint
CREATE INDEX "applications_job_hunt_stage_idx" ON "applications" USING btree ("job_hunt_id","stage");--> statement-breakpoint
CREATE UNIQUE INDEX "sub_stages_user_stage_name_unique" ON "sub_stages" USING btree ("user_id","stage","name");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_name_unique" ON "tags" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account_unique" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "events_application_id_idx" ON "events" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "events_scheduled_at_idx" ON "events" USING btree ("scheduled_at");--> statement-breakpoint
CREATE UNIQUE INDEX "one_active_job_hunt_per_user" ON "job_hunts" USING btree ("user_id") WHERE "job_hunts"."status" = 'active';--> statement-breakpoint
CREATE INDEX "resumes_user_scope_idx" ON "resumes" USING btree ("user_id","scope");--> statement-breakpoint
CREATE INDEX "resumes_application_id_idx" ON "resumes" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "notification_rules_user_kind_idx" ON "notification_rules" USING btree ("user_id","kind");--> statement-breakpoint
CREATE INDEX "notifications_user_status_created_idx" ON "notifications" USING btree ("user_id","status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_user_dedup_key_unique" ON "notifications" USING btree ("user_id","dedup_key");