ALTER TABLE "blog_post" ADD COLUMN "author" text DEFAULT 'Beans & Brews' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;