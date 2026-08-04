import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";

import { db } from "../../db";
import { usersTable } from "../../db/schema";
import ApiError from "../utils/apiError";
import { verifyAccessToken } from "../utils/token";

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const accessToken = authHeader.split(" ")[1];

  if (!accessToken) {
    throw ApiError.unauthorized("Access token is missing");
  }

  const payload = verifyAccessToken(accessToken);

  if (payload instanceof Error) {
    throw ApiError.unauthorized("Invalid or expired access token");
  }

  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
    })
    .from(usersTable)
    .where(eq(usersTable.id, payload.id));

  if (!user) {
    throw ApiError.unauthorized("User not found");
  }

  req.user = user;
  return next();
};

export const restrictToAuthUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    throw ApiError.unauthorized("Unauthorized");
  }

  return next();
};
