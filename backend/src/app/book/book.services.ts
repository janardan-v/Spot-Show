import { eq } from "drizzle-orm";
import { db, pool } from "../../db";
import { seatsTable } from "../../db/schema";
import type { getSeatData, bookTicketData } from "./book.model";
import ApiError from "../../common/utils/apiError";
import ApiResponse from "../../common/utils/apiResponse";
import type { PoolClient } from "pg";

export class bookingService {
  static async getSeats({ showId }: getSeatData) {
    const showSeatResult = await db
      .select({
        id: seatsTable.id,
        isBooked: seatsTable.isBooked,
      })
      .from(seatsTable)
      .where(eq(seatsTable.showId, showId));

    if (!showSeatResult) {
      throw ApiError.internalServerError("Error while fetching seats");
    }
    return ApiResponse.success("Fetched seats successfully", {
      showSeatResult,
    });
  }

  static async bookSeat({ seatId, userId }: bookTicketData) {
    const conn = await pool.connect(); // pick a connection from the pool
    try {
      // payment integration should be here
      // verify payment
      //begin transaction
      // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
      await conn.query("BEGIN");
      //getting the row to make sure it is not booked
      /// $1 is a variable which we are passing in the array as the second parameter of query function,
      // Why do we use $1? -> this is to avoid SQL INJECTION
      // (If you do ${id} directly in the query string,
      // then it can be manipulated by the user to execute malicious SQL code)
      const sql =
        "SELECT * FROM seats where id = $1 and is_booked = false FOR UPDATE";
      const result = await conn.query(sql, [seatId]);

      //if no rows found then the operation should fail can't book
      // This shows we Do not have the current seat available for booking
      if (result.rowCount === 0) {
        throw ApiError.conflict("Seat already booked");
      }
      console.log(userId)
      //if we get the row, we are safe to update
      const sqlU = "update seats set is_booked = true, booked_by = $2 where id = $1";
      const updateResult = await conn.query(sqlU, [seatId, userId]); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders

      //end transaction by committing
      await conn.query("COMMIT");
      conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)
      return ApiResponse.success("Seat Booked Successfully", updateResult);
    } catch (err) {
      await conn.query("ROLLBACK");

      if (err instanceof ApiError) throw err;

      throw ApiError.internalServerError(
        err instanceof Error ? err.message : "Unknown error",
      );
    }
  }
}
