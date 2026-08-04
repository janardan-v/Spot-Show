CREATE TABLE "movies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"movie_name" varchar(255) NOT NULL,
	"total_seats" integer NOT NULL,
	"show_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"is_booked" boolean DEFAULT false,
	"show_id" uuid,
	"booked_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"password" text NOT NULL,
	"salt" text NOT NULL,
	"refresh_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_show_id_movies_id_fkey" FOREIGN KEY ("show_id") REFERENCES "movies"("id");--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_booked_by_users_id_fkey" FOREIGN KEY ("booked_by") REFERENCES "users"("id");