import type {
  userLoginData,
  userLogoutData,
  UserRegisterData,
} from "./auth.model";
import { db } from "../../db/index";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import ApiError from "../../common/utils/apiError";
import crypto from "crypto";
import ApiResponse from "../../common/utils/apiResponse";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../common/utils/token";

export class userServices {
  static async register(data: UserRegisterData) {
    const { name, email, age, password } = data;

    const [userEmailResult] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (userEmailResult) {
      throw ApiError.notFound("User already exists with this email");
    }

    const salt = crypto.randomBytes(32).toString("hex");
    const hashedPassword = crypto
      .createHmac("sha256", salt)
      .update(password)
      .digest("hex");
    const [insertUserResult] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        age,
        password: hashedPassword,
        salt,
      })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
      });

    if (!insertUserResult) {
      throw ApiError.internalServerError("Error while creating user");
    }
    return ApiResponse.created("User registered successfully", {
      id: insertUserResult.id,
      email: insertUserResult.email,
    });
  }
  static async login(data: userLoginData) {
    const { email, password } = data;

    const [userEmailResult] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!userEmailResult) {
      throw ApiError.notFound("No User exists with this email");
    }
    const salt = userEmailResult.salt;
    const hashedPassword = crypto
      .createHmac("sha256", salt)
      .update(password)
      .digest("hex");
    if (hashedPassword != userEmailResult.password) {
      throw ApiError.unauthorized("Email or password is incorrect");
    }
    const accessToken = createAccessToken({ id: userEmailResult.id });
    const refreshToken = createRefreshToken({ id: userEmailResult.id });

    await db
      .update(usersTable)
      .set({
        refreshToken,
      })
      .where(eq(usersTable.id, userEmailResult.id));

    return ApiResponse.success("Login successful", {
      accessToken,
      refreshToken,
    });
  }

  static async logout(accessToken: string) {
    const decodedToken = verifyAccessToken(accessToken);

    if (decodedToken instanceof Error) {
      throw ApiError.unauthorized("Error while decoding token");
    }

    const id = decodedToken.id;
    await db
      .update(usersTable)
      .set({
        refreshToken: null,
      })
      .where(eq(usersTable.id, id));

    return ApiResponse.success("User logged out successfully", {});
  }

  static async getMe(accessToken: string) {
    const decodedToken = verifyAccessToken(accessToken);

    if (decodedToken instanceof Error) {
      throw ApiError.unauthorized("Error while decoding token");
    }
    const id = decodedToken.id;
    const [userIdSelect] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!userIdSelect) throw ApiError.notFound("User not found");

    const user = {
      id: userIdSelect.id,
      name: userIdSelect.name,
      email: userIdSelect.email,
    };

    return ApiResponse.success("User found", user);
  }

  static async refresh(refreshToken: string) {
  const decodedToken = verifyRefreshToken(refreshToken);

  if (decodedToken instanceof Error) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const id = decodedToken.id;

  const [user] = await db
    .select({
      id: usersTable.id,
      refreshToken: usersTable.refreshToken,
    })
    .from(usersTable)
    .where(eq(usersTable.id, id));

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const accessToken = createAccessToken({ id });

  return ApiResponse.success("Access token refreshed", {
    accessToken,
  });
}
}
