import { asc, eq } from "drizzle-orm";
import { db, pool } from "../../db";
import { moviesTable, seatsTable } from "../../db/schema";
import type { getSeatData, bookTicketData } from "./book.model";
import ApiError from "../../common/utils/apiError";
import ApiResponse from "../../common/utils/apiResponse";

export class bookingService {
  static async getSeats({ showId }: getSeatData) {
    const showSeatResult = await db
      .select({
        id: seatsTable.id,
        isBooked: seatsTable.isBooked,
      })
      .from(seatsTable)
      .where(eq(seatsTable.showId, showId))
      .orderBy(asc(seatsTable.id));

    if (!showSeatResult) {
      throw ApiError.internalServerError("Error while fetching seats");
    }
    return ApiResponse.success("Fetched seats successfully", {
      showSeatResult,
    });
  }

  static async getShows() {
    const showResult = await db
      .select({
        id: moviesTable.id,
        movieName: moviesTable.movieName,
        totalSeats: moviesTable.totalSeats,
        showDate: moviesTable.showDate,
      })
      .from(moviesTable);

    if (!showResult) {
      throw ApiError.internalServerError("Error while fetching shows");
    }
    return ApiResponse.success("Fetched shows successfully", {
      showResult,
    });
  }

  static async bookSeat({ seatId, userId }: bookTicketData) {
    const conn = await pool.connect();
    try {
      await conn.query("BEGIN");
      const sql =
        "SELECT * FROM seats where id = $1 and is_booked = false FOR UPDATE";
      const result = await conn.query(sql, [seatId]);

      if (result.rowCount === 0) {
        throw ApiError.conflict("Seat already booked");
      }

      const sqlU =
        "update seats set is_booked = true, booked_by = $2 where id = $1";
      const updateResult = await conn.query(sqlU, [seatId, userId]);

      await conn.query("COMMIT");
      return ApiResponse.success("Seat Booked Successfully", updateResult);
    } catch (err) {
      await conn.query("ROLLBACK");

      if (err instanceof ApiError) throw err;

      throw ApiError.internalServerError(
        err instanceof Error ? err.message : "Unknown error",
      );
    } finally {
      conn.release();
    }
  }
}
