import type { Request, Response, NextFunction } from "express";
import ApiError from "../../common/utils/apiError";
import { bookingService } from "./book.services";

export class bookingController {
  static async bookTicket(req: Request, res: Response) {
    const { seatId } = req.params;

    if (typeof seatId !== "string") {
      throw ApiError.badRequest("showId and date are required");
    }
    const userId = req.user?.id!;

    const result = await bookingService.bookSeat({
      seatId,
      userId,
    });

    if (!result.success) {
      throw ApiError.internalServerError("Server went while booking your sear");
    }

    return res.status(result.statusCode).json(result.data);
  }
  static async getShows(req: Request, res: Response) {
    const result = await bookingService.getShows();

    return res.status(result.statusCode).json(result.data);
  }
  static async getSeats(req: Request, res: Response) {
    const { showId } = req.params;

    if (typeof showId !== "string") {
      throw ApiError.badRequest("showId and date are required");
    }

    const result = await bookingService.getSeats({ showId });

    return res.status(result.statusCode).json(result.data);
  }
}
