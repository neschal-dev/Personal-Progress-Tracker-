/**
 * Node Modules
 */
import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";

/**
 *Custom Modules
 */
import { notFound } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

/*
 *Routes
 */

import router from "./routes/index.js";

/**
 *Config
 */
import { common } from "./configs/index.js";
import { connectDB, disconnectDB } from "./db/index.js";
import { Server } from "http";
/**
 *Initial Express
 */
const app: Express = express();
const PORT = common.PORT;

/**
 *Middlewares
 */

app.use(
  cors({ origin: common.CLIENT_URL, credentials: true }),
  express.json(),
  helmet(),
  cookieParser(),
  session({
    secret: common.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: common.IS_PRODUCTION, // true in prod (requires HTTPS), false for local http://localhost
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 10, // 10 min — state only needs to live briefly during the OAuth handshake
    },
  }),
);

// Immediately Inovoke async Function to Initialize application
(async function (): Promise<void> {
  try {
    // Establish a postgres db connection
    await connectDB();
    // Register application routes under the  root path
    app.use("/api/v1", router);

    // Catch-all for unmatched routes — must come after routes, before the error handler
    app.use(notFound);

    // Centralized error handler any error  thrown/forwared from a route
    // including promises in async handlers ends up here so we
    // return consistant JSON response instead of leaking stack traces
    app.use(errorHandler);

    // Start server and listen on a configure port
    app.listen(PORT, () =>
      console.log(`Server running on: http://localhost:${PORT}`),
    );
  } catch (err) {
    // Log a critical error if server starts to fail
    console.error("Failed to start server:", err);

    // In production , exit the process to avoid running in unstable process
    if (common.IS_PRODUCTION) {
      process.exit(1);
    }
  }
})();

const serverTermination = async (signal: NodeJS.Signals): Promise<void> => {
  try {
    console.info(`Server Shutdown`, signal);

    // Disconnect from postgres database
    await disconnectDB();
    // Log a warning indicating  the server is shutting down
    console.info(`Server Shutdown`, signal);

    // Exit the process cleanly
    process.exit(0);
  } catch (err) {
    // Log any errors occured during the shutdown process
    console.error(`Error during server shutdown : ${err}`);

    // Exit with a non-zero code so the failure is surfaced to the
    // process manger instead of leaving the process hanging
    process.exit(1);
  }
};

// Listen for the termination and trigger graceful shutdown
process.on("SIGTERM", serverTermination);
process.on("SIGINT", serverTermination);
