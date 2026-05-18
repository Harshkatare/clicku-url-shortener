import { Request, Response } from "express";

import * as urlService from "./url.service.js";

import { createUrlSchema } from "./url.schema.js";

export async function createShortUrl(
  req: Request,
  res: Response
) {
  const validatedData =
    createUrlSchema.parse(req.body);

  const createdUrl =
    await urlService.createShortUrl(
      validatedData,
      req.user!.id
    );

  res.status(201).json({
    success: true,
    data: createdUrl,
  });
}