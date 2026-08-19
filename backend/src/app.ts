import express from "express";
import authRouter from "./app/auth/auth.routes";
import cors from "cors";
import bookRouter from "./app/book/book.routes";
import { authorize } from "./common/middlewares/authorizeMiddleware";
import { errorHandler } from "./common/middlewares/errorHandler";

const createServerApplication = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });



  app.use("/api/v1/auth", authRouter);
  app.use(authorize)
  app.use("/api/v1/shows", bookRouter);
  app.use(errorHandler);
  return app;
};
export default createServerApplication;
