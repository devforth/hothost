import path from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from "cookie-parser";

import apiRouter from "./api.js";
import nextApiRouter from "./apinext.js";

import env from "./env.js";
import database from "./database.js";
import PluginManager from "./pluginManager.js";

import {
  calculateAsyncEvents,
  checkUserExistsOrCreate,
  DATE_HUMANIZER_CONFIG,
  startScheduler,
  dbClearScheduler,
} from "./utils.js";
import { authMiddleware } from "./middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, "..");

async function main() {
  await database.read();
  await PluginManager().loadPlugins();
  await checkUserExistsOrCreate();
  startScheduler();
  setTimeout(() => setInterval(calculateAsyncEvents, 1000), 90 * 1000);
  setInterval(dbClearScheduler, 100 * 1000);

  const app = express();

  const port = env.WEB_PORT || 8007;

  app.use(
    express.json({
      verify: (req, res, buf) => {
        // keep the raw bytes around so a JSON parse failure below can log
        // exactly what the client sent instead of just "Unexpected token"
        req.rawBody = buf.toString("utf8");
      },
    })
  );
  // surfaces malformed JSON bodies (e.g. from a buggy agent build) instead of
  // letting Express's default handler swallow the payload
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
      const posMatch = /position (\d+)/.exec(err.message);
      console.error(
        `[JSON parse error] ${req.method} ${req.originalUrl}: ${err.message}`
      );
      if (req.rawBody) {
        if (posMatch) {
          const pos = parseInt(posMatch[1], 10);
          const start = Math.max(0, pos - 60);
          const end = Math.min(req.rawBody.length, pos + 60);
          console.error(
            `[JSON parse error] around position ${pos}: ...${req.rawBody.slice(
              start,
              end
            )}...`
          );
        }
        console.error(`[JSON parse error] raw body: ${req.rawBody}`);
      }
      return res.status(400).send({ error: "Invalid JSON payload" });
    }
    next(err);
  });
  app.use(cookieParser());

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(express.static(`${rootDir}/frontend/dist`));
  app.use(authMiddleware);

  app.use("/api/", apiRouter);
  app.use("/api/v2/", nextApiRouter);
  app.use("/v2/", nextApiRouter);

  app.get("*", function (request, response) {
    response.sendFile(path.resolve("frontend/dist/index.html"));
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(
      `🔥🔥🔥 ${new Date().toISOString()} Hothost is listening on port ${port}`
    );
  });
}

process.on("unhandledRejection", (reason) => {
  console.error(`[unhandledRejection] ${new Date().toISOString()}`, reason);
});

main().catch(console.error);
