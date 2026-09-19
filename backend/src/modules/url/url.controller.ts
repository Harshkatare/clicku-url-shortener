import { Request, Response } from "express";

import * as urlService from "./url.service.js";
import { 
  createUrlSchema, 
  updateUrlSchema,
  urlParamsSchema,
  claimUrlSchema,
  urlQuerySchema,
  reorderUrlSchema,
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
  const slug = (req.params.slug || req.params.shortCode) as string;

  const originalUrl =
    await urlService.redirectToOriginalUrl(
      slug
    );

    const queryKeys = Object.keys(req.query);
    if (queryKeys.length > 0) {
      try{
        const targetUrl = new URL(originalUrl);

        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === "string") {
            targetUrl.searchParams.set(key, value);
          }
          else if (Array.isArray(value)) {
            targetUrl.searchParams.delete(key);

            for (const v of value) {
              if (typeof v === "string") {
                targetUrl.searchParams.append(key, v);
              }
            }
          }
        }
        return res.redirect(targetUrl.toString());
      } catch {
        return res.redirect(originalUrl);
      }
    }

  res.redirect(originalUrl);
}

export async function getUserUrls(
  req: Request,
  res: Response
) {
  const validatedQuery = urlQuerySchema.parse(req.query);

  const result =
    await urlService.getUserUrls(
      req.user!.id,
      validatedQuery
    );

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}

export async function getUserUrlStats(
  req: Request,
  res: Response
) {
  const stats = await urlService.getUserUrlStats(req.user!.id);

  res.status(200).json({
    success: true,
    data: stats,
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

export async function reorderUrl(
  req: Request,
  res: Response
) {
  const { id } = urlParamsSchema.parse(req.params);
  const { newSortOrder } = reorderUrlSchema.parse(req.body);

  const updatedUrl = await urlService.reorderUrl(
    id,
    req.user!.id,
    newSortOrder
  );

  res.status(200).json({
    success: true,
    message: "Card reordered successfully",
    data: updatedUrl,
  });
}