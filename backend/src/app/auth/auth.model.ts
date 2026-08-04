import { z } from "zod";

export const userRegisterSchema = z.object({
  name: z.string(),
  email: z.email("Invalid Email Password"),
  password: z.string(),
  age: z.number(),
});

export type UserRegisterData = z.infer<typeof userRegisterSchema>;

export const userLoginSchema = z.object({
  email: z.email("Invalid Email Password"),
  password: z.string(),
});

export type userLoginData = z.infer<typeof userLoginSchema>;

export const userLogoutSchema = z.object({
  id: z.string(),
});

export type userLogoutData = z.infer<typeof userLogoutSchema>;
