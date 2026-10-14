import type { Request, Response } from "express";
import * as adminService from "./admin.service.js";

/**
 * Controller endpoint for system-wide administrative statistics.
 * Aggregations only execute after passing through authentication and adminGuard.
 */
export async function getAdminStats(
  _req: Request,
  res: Response
): Promise<void> {
  const stats = await adminService.getAdminPlatformStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
}
