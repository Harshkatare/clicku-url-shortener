import app from "./app.js";

import { env } from "./config/env.js";

import { logger } from "./lib/logger.js";

import { pool } from "./db/index.js";

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(
    `Server running on port ${PORT}`
  );
});

async function gracefulShutdown(
  signal: string
) {
  logger.info(
    `${signal} received. Shutting down gracefully...`
  );

  const forceExitTimeout = setTimeout(() => {
    logger.error("Graceful shutdown timed out after 10s. Forcing process exit.");
    process.exit(1);
  }, 10000);
  forceExitTimeout.unref();

  server.close(async () => {
    try {
      await pool.end();

      logger.info(
        "Database pool closed"
      );

      process.exit(0);
    } catch (error) {
      logger.error({ error }, "Error encountered while closing database pool");
      process.exit(1);
    }
  });
}

process.on(
  "SIGINT",
  () => gracefulShutdown("SIGINT")
);

process.on(
  "SIGTERM",
  () => gracefulShutdown("SIGTERM")
);

process.on(
  "uncaughtException",
  (error) => {
    logger.error(error);

    process.exit(1);
  }
);

process.on(
  "unhandledRejection",
  (reason) => {
    logger.error(reason);

    process.exit(1);
  }
);