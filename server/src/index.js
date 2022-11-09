import path from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
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
const rootDir = path.join(__dirname, '..')



async function main() {
  await database.read();
  await PluginManager().loadPlugins();
  await checkUserExistsOrCreate();
  startScheduler();
  setTimeout(() => setInterval(calculateAsyncEvents, 1000), 90 * 1000);
  setInterval(dbClearScheduler, 100 * 1000);

  const app = express();

  const port = env.WEB_PORT || 8007;

  app.use(express.json());
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


  app.get('*', function (request, response) {
  
    response.sendFile(path.resolve('frontend/dist/index.html'));
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(
      `🔥🔥🔥 ${new Date().toISOString()} Hothost is listening on port ${port}`
    );
  });
}

main().catch(console.error);
