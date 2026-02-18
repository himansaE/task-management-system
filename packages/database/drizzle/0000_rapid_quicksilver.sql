CREATE TYPE "public"."task_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('TODO', 'IN_PROGRESS', 'DONE');--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" text,
	"priority" "task_priority" DEFAULT 'MEDIUM' NOT NULL,
	"status" "task_status" DEFAULT 'TODO' NOT NULL,
	"due_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(80) NOT NULL,
	"password_hash" text NOT NULL,
	"token_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");