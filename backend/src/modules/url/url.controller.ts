import { Request, Response } from "express";

import * as urlService from "./url.service.js";
import { 
  createUrlSchema, 
  updateUrlSchema,
  urlParamsSchema,
  claimUrlSchema,
 } from "./url.schema.js";

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

export async function createDemoUrl(
  req: Request,
  res: Response
) {
  const validatedData = createUrlSchema.parse(req.body);

  const createdUrl = await urlService.createShortUrl(
    validatedData,
    null
  );

  res.status(201).json({
    success: true,
    data: createdUrl,
  });
}

export async function redirectToOriginalUrl(
  req: Request,
  res: Response
) {
  const shortCode =
    req.params.shortCode as string;

  const originalUrl =
    await urlService.redirectToOriginalUrl(
      shortCode
    );

  res.redirect(originalUrl);
}

export async function getUserUrls(
  req: Request,
  res: Response
) {
  const userUrls =
    await urlService.getUserUrls(
      req.user!.id
    );

  res.status(200).json({
    success: true,
    data: userUrls,
  });
}

export async function deleteUrl(
  req: Request,
  res: Response
) {
    const { id } = 
      urlParamsSchema.parse(req.params);

      const deleteUrl =
        await urlService.deleteUrl(
          id,
          req.user!.id
        );

      res.status(200).json({
        success: true,
        data: deleteUrl,
      });
}

export async function updateUrl(
  req: Request,
  res: Response
) {
    const { id } = 
      urlParamsSchema.parse(req.params);

  const validatedData =
    updateUrlSchema.parse(req.body);

  const updatedUrl = 
    await urlService.updateUrl(
      id,
      req.user!.id,
      validatedData
    );
  
  res.status(200).json({
    success: true,
    data: updatedUrl,
  });
}

export async function claimUrl(
  req: Request,
  res: Response
) {
  const { shortCode } = claimUrlSchema.parse(req.body);

  const claimedUrl = await urlService.claimUrl(
    shortCode,
    req.user!.id
  );

  res.status(200).json({
    success: true,
    message: "URL claimed successfully",
    data: claimedUrl,
  });
}