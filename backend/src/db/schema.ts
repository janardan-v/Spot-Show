import {
  integer,
  pgTable,
  varchar,
  uuid,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: text().notNull(),
  salt: text().notNull(),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const moviesTable = pgTable("movies", {
  id: uuid().defaultRandom().primaryKey(),
  movieName: varchar("movie_name", { length: 255 }).notNull(),
  totalSeats: integer("total_seats").notNull(),
  showDate: timestamp("show_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const seatsTable = pgTable("seats", {
  id: uuid().defaultRandom().primaryKey(),
  isBooked: boolean("is_booked").default(false),

  showId: uuid("show_id").references(() => moviesTable.id),
  bookedBY: uuid("booked_by").references(() => usersTable.id),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
