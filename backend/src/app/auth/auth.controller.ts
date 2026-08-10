import type { Request, Response } from "express";
import { userLoginSchema, userRegisterSchema } from "./auth.model";
import ApiError from "../../common/utils/apiError";
import { userServices } from "./auth.services"

export class userController {
  static async register(req: Request, res: Response) {
    const data = await userRegisterSchema.safeParseAsync(req.body);

    if (!data.success) {
      throw ApiError.badRequest(data.error.message);
    }
    const result = await userServices.register(data.data);

    return res.status(result.statusCode).json(result.data);
  }
  static async login(req: Request, res: Response) {
    const data = await userLoginSchema.safeParseAsync(req.body);

    if (!data.success) {
      throw ApiError.badRequest(data.error.message);
    }
    const result = await userServices.login(data.data);

    return res.status(result.statusCode).json(result.data);
  }

  static async getMe(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Invalid token");
    }
    const accessToken = authHeader.split(" ")[1];
    const result = await userServices.getMe(accessToken!);

    if(!result.data){
      throw ApiError.internalServerError("Error while fetching user data");
    }
    return res.status(result.statusCode).json(result.data);
  }

  static async logout(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Invalid token");
    }
    const accessToken = authHeader.split(" ")[1];
    const result = await userServices.logout(accessToken!);

    return res.status(result.statusCode).json(result.data);
  }
  static async refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ApiError.unauthorized("Refresh token is required");
  }

  const result = await userServices.refresh(refreshToken);

  return res.status(result.statusCode).json(result.data);
}
}
