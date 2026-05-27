import app from "./app";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";


const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(
    `Server running on port ${PORT}`
  );
});
