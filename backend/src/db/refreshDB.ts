import { db } from "./index";
import { seatsTable } from "./schema";

export const refreshDB = async () => {
  await db
    .update(seatsTable)
    .set({
      isBooked: false,
      bookedBY: null,
    });

  console.log("Database refreshed successfully.");
};