import { Request, Response } from "express";
import * as analyticsService from "./analytics.service.js";
import { analyticsQuerySchema } from "./analytics.schema.js";
import { urlParamsSchema } from "../url/url.schema.js";

export async function getUrlAnalytics(req: Request, res: Response) {
  const { id } = urlParamsSchema.parse(req.params);
  const validatedQuery = analyticsQuerySchema.parse(req.query);

  const result = await analyticsService.getUrlAnalytics(
    id,
    req.user!.id,
    validatedQuery
  );

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function getOverviewAnalytics(req: Request, res: Response) {
  const validatedQuery = analyticsQuerySchema.parse(req.query);

  const result = await analyticsService.getOverviewAnalytics(
    req.user!.id,
    validatedQuery
  );

  res.status(200).json({
    success: true,
    data: result,
  });
}
