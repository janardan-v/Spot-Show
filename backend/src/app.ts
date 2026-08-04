import express from "express";
import authRouter from "./app/auth/auth.routes";
import cors from "cors";
import bookRouter from "./app/book/book.routes";
import { authorize } from "./common/middlewares/authorizeMiddleware";

const createServerApplication = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.get("/", (req, res) => {
    res.json("HEllO ji");
  });


  app.use("/api/v1/auth", authRouter);
  app.use(authorize)
  app.use("/api/v1/shows", bookRouter);
  return app;
};
export default createServerApplication;
