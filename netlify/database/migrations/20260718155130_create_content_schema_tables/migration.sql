CREATE TYPE "content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "media_type" AS ENUM('image', 'pdf', 'video');--> statement-breakpoint
CREATE TYPE "question_priority" AS ENUM('one', 'two', 'three', 'four', 'five');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('student', 'admin');--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" serial PRIMARY KEY,
	"name" varchar(160) NOT NULL,
	"code" varchar(30) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"icon" varchar(80),
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY,
	"topic_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"parent_id" integer,
	"body" text NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_audit_log" (
	"id" serial PRIMARY KEY,
	"user_id" integer,
	"entity_type" varchar(60) NOT NULL,
	"entity_id" integer NOT NULL,
	"action" varchar(40) NOT NULL,
	"changes" jsonb DEFAULT '{}' NOT NULL,
	"occurred_on" date DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "previous_questions" (
	"id" serial PRIMARY KEY,
	"topic_id" integer NOT NULL,
	"year" integer NOT NULL,
	"month" varchar(20) NOT NULL,
	"marks" integer NOT NULL,
	"priority" "question_priority" DEFAULT 'three'::"question_priority" NOT NULL,
	"question" text NOT NULL,
	"answer" text DEFAULT '' NOT NULL,
	"source" varchar(160),
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revision_history" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	"revised_at" timestamp with time zone DEFAULT now() NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"confidence" "difficulty",
	"note" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "semesters" (
	"id" serial PRIMARY KEY,
	"branch_id" integer NOT NULL,
	"semester_number" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_progress" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	"difficulty" "difficulty",
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"last_read_at" timestamp with time zone,
	"reading_seconds" integer DEFAULT 0 NOT NULL,
	"revision_count" integer DEFAULT 0 NOT NULL,
	"last_revision_at" timestamp with time zone,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_sessions" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"topic_id" integer,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY,
	"semester_id" integer NOT NULL,
	"name" varchar(180) NOT NULL,
	"code" varchar(40) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"cover_image_key" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_images" (
	"id" serial PRIMARY KEY,
	"topic_id" integer NOT NULL,
	"storage_key" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"alt_text" varchar(255) DEFAULT '' NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"file_size" integer DEFAULT 0 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_media" (
	"id" serial PRIMARY KEY,
	"topic_id" integer NOT NULL,
	"uploaded_by" integer,
	"media_type" "media_type" NOT NULL,
	"storage_key" text,
	"external_url" text,
	"title" varchar(255) NOT NULL,
	"mime_type" varchar(100),
	"file_size" integer,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_relations" (
	"topic_id" integer,
	"related_topic_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topic_relations_pkey" PRIMARY KEY("topic_id","related_topic_id")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY,
	"unit_id" integer NOT NULL,
	"author_id" integer,
	"title" varchar(220) NOT NULL,
	"slug" varchar(240) NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"definition" text DEFAULT '' NOT NULL,
	"explanation" text DEFAULT '' NOT NULL,
	"diagram" text DEFAULT '' NOT NULL,
	"examples" text DEFAULT '' NOT NULL,
	"advantages" text DEFAULT '' NOT NULL,
	"disadvantages" text DEFAULT '' NOT NULL,
	"applications" text DEFAULT '' NOT NULL,
	"interview_questions" text DEFAULT '' NOT NULL,
	"exam_questions" text DEFAULT '' NOT NULL,
	"revision_notes" text DEFAULT '' NOT NULL,
	"references" text DEFAULT '' NOT NULL,
	"keywords" jsonb DEFAULT '[]' NOT NULL,
	"difficulty" "difficulty" DEFAULT 'medium'::"difficulty" NOT NULL,
	"status" "content_status" DEFAULT 'draft'::"content_status" NOT NULL,
	"estimated_reading_minutes" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" serial PRIMARY KEY,
	"subject_id" integer NOT NULL,
	"unit_number" integer NOT NULL,
	"title" varchar(180) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"overview" text DEFAULT '' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" integer PRIMARY KEY,
	"dark_mode" boolean DEFAULT false NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"compact_sidebar" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'student'::"user_role" NOT NULL,
	"avatar_key" text,
	"email_verified_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "bookmarks_user_topic_unique" ON "bookmarks" ("user_id","topic_id");--> statement-breakpoint
CREATE INDEX "bookmarks_user_idx" ON "bookmarks" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "branches_code_unique" ON "branches" ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "branches_slug_unique" ON "branches" ("slug");--> statement-breakpoint
CREATE INDEX "branches_active_order_idx" ON "branches" ("is_active","display_order");--> statement-breakpoint
CREATE INDEX "comments_topic_created_idx" ON "comments" ("topic_id","created_at");--> statement-breakpoint
CREATE INDEX "comments_parent_idx" ON "comments" ("parent_id");--> statement-breakpoint
CREATE INDEX "content_audit_entity_idx" ON "content_audit_log" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "content_audit_user_idx" ON "content_audit_log" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_token_hash_unique" ON "password_reset_tokens" ("token_hash");--> statement-breakpoint
CREATE INDEX "password_reset_user_idx" ON "password_reset_tokens" ("user_id");--> statement-breakpoint
CREATE INDEX "previous_questions_topic_year_idx" ON "previous_questions" ("topic_id","year");--> statement-breakpoint
CREATE INDEX "revision_history_user_date_idx" ON "revision_history" ("user_id","revised_at");--> statement-breakpoint
CREATE INDEX "revision_history_topic_idx" ON "revision_history" ("topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "semesters_branch_number_unique" ON "semesters" ("branch_id","semester_number");--> statement-breakpoint
CREATE UNIQUE INDEX "semesters_branch_slug_unique" ON "semesters" ("branch_id","slug");--> statement-breakpoint
CREATE INDEX "semesters_branch_idx" ON "semesters" ("branch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "study_progress_user_topic_unique" ON "study_progress" ("user_id","topic_id");--> statement-breakpoint
CREATE INDEX "study_progress_user_completed_idx" ON "study_progress" ("user_id","is_completed");--> statement-breakpoint
CREATE INDEX "study_sessions_user_started_idx" ON "study_sessions" ("user_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "subjects_semester_code_unique" ON "subjects" ("semester_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "subjects_semester_slug_unique" ON "subjects" ("semester_id","slug");--> statement-breakpoint
CREATE INDEX "subjects_semester_order_idx" ON "subjects" ("semester_id","display_order");--> statement-breakpoint
CREATE INDEX "topic_images_topic_order_idx" ON "topic_images" ("topic_id","display_order");--> statement-breakpoint
CREATE INDEX "topic_media_topic_type_idx" ON "topic_media" ("topic_id","media_type");--> statement-breakpoint
CREATE INDEX "topic_relations_related_idx" ON "topic_relations" ("related_topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "topics_unit_slug_unique" ON "topics" ("unit_id","slug");--> statement-breakpoint
CREATE INDEX "topics_unit_order_idx" ON "topics" ("unit_id","display_order");--> statement-breakpoint
CREATE INDEX "topics_status_idx" ON "topics" ("status");--> statement-breakpoint
CREATE INDEX "topics_difficulty_idx" ON "topics" ("difficulty");--> statement-breakpoint
CREATE UNIQUE INDEX "units_subject_number_unique" ON "units" ("subject_id","unit_number");--> statement-breakpoint
CREATE UNIQUE INDEX "units_subject_slug_unique" ON "units" ("subject_id","slug");--> statement-breakpoint
CREATE INDEX "units_subject_order_idx" ON "units" ("subject_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" ("role");--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "content_audit_log" ADD CONSTRAINT "content_audit_log_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "previous_questions" ADD CONSTRAINT "previous_questions_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "previous_questions" ADD CONSTRAINT "previous_questions_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "revision_history" ADD CONSTRAINT "revision_history_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "revision_history" ADD CONSTRAINT "revision_history_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "study_progress" ADD CONSTRAINT "study_progress_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "study_progress" ADD CONSTRAINT "study_progress_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_semester_id_semesters_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topic_images" ADD CONSTRAINT "topic_images_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topic_media" ADD CONSTRAINT "topic_media_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topic_media" ADD CONSTRAINT "topic_media_uploaded_by_users_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "topic_relations" ADD CONSTRAINT "topic_relations_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topic_relations" ADD CONSTRAINT "topic_relations_related_topic_id_topics_id_fkey" FOREIGN KEY ("related_topic_id") REFERENCES "topics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_unit_id_units_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_subject_id_subjects_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;