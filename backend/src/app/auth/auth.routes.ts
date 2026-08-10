import { Router } from "express";
import { userController } from "./auth.controller";

const authRouter = Router();

authRouter.post("/register", userController.register);
authRouter.post("/login", userController.login);
authRouter.get("/profile", userController.getMe);
authRouter.get("/logout", userController.logout);
authRouter.post("/refresh", userController.refresh);

export default authRouter