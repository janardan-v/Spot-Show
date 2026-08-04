import "dotenv/config";
import { db } from "./index";
import { moviesTable, seatsTable } from "./schema";

async function seed() {
  const [movie] = await db
    .insert(moviesTable)
    .values({
      movieName: "Spider-Man: Brand New Day",
      totalSeats: 100,
      showDate: new Date("2026-08-05T18:00:00"),
    })
    .returning();

  console.log("Movie created:", movie);

  const seats = Array.from({ length: 100 }, () => ({
    showId: movie!.id,
    isBooked: false,
  }));

  await db.insert(seatsTable).values(seats);

  console.log("100 seats created successfully.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
