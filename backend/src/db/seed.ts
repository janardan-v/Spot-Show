import "dotenv/config";
import { db } from "./index";
import { moviesTable, seatsTable } from "./schema";

async function seed() {
  const movies = [
    {
      movieName: "Spider-Man: Brand New Day",
      totalSeats: 100,
      showDate: new Date("2026-08-15T18:00:00"),
    },
    {
      movieName: "Avengers: Doomsday",
      totalSeats: 100,
      showDate: new Date("2026-08-16T18:00:00"),
    },
    {
      movieName: "Mahavatar Narasimha",
      totalSeats: 100,
      showDate: new Date("2026-08-17T18:00:00"),
    },
    {
      movieName: "Mahavatar Parshuram",
      totalSeats: 100,
      showDate: new Date("2026-08-18T18:00:00"),
    },
  ];

  for (const movieData of movies) {
    const [movie] = await db
      .insert(moviesTable)
      .values(movieData)
      .returning();

    const seats = Array.from({ length: movieData.totalSeats }, () => ({
      showId: movie!.id,
      isBooked: false,
    }));

    await db.insert(seatsTable).values(seats);
  }

  console.log("Database seeded successfully.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });