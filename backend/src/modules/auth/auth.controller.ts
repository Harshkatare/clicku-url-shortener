import { Request, Response } from "express";

import { signupSchema } from "./auth.schema.js";

import * as authService from "./auth.service.js";

export async function signup(
  req: Request,
  res: Response
) {
  const validatedData = signupSchema.parse(req.body);

  const result = await authService.signup(
    validatedData
  );

  res.status(201).json({
    success: true,
    data: result,
  });
}