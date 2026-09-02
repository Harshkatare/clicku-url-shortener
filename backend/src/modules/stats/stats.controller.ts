import { Request, Response } from "express";
import * as statsService from "./stats.service.js";

export async function getPublicStats(
    _req: Request, 
    res: Response
) {
  const stats = await statsService.getPublicStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
}
