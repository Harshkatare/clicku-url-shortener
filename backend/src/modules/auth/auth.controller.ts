import { Request, Response } from "express";

import { signupSchema, loginSchema } from "./auth.schema.js";

import * as authService from "./auth.service.js";

export async function signup(
  req: Request,
  res: Response
) {
  const validatedData = signupSchema.parse(
    req.body
  );

  const result = await authService.signup(
    validatedData
  );

  res.status(201).json({
    success: true,
    data: result,
  });
}


export async function login(
  req: Request,
  res: Response
) {
  const validatedData = loginSchema.parse(
    req.body
  );

  const result = await authService.login(
    validatedData
  );

  res.status(200).json({
    success: true,
    data: result,
  });
}