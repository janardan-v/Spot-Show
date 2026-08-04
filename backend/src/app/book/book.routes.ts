import { Router } from "express";
import { bookingController } from "./book.controller";
import { restrictToAuthUser } from "../../common/middlewares/authorizeMiddleware";

const bookRouter = Router();

bookRouter.get("/seats/:showId", bookingController.getSeats);
bookRouter.post("/book/:seatId", restrictToAuthUser, bookingController.bookTicket);

export default bookRouter;
