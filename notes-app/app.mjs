import fs from "fs-extra";
import { fileURLToPath } from "url";
import express from "express";
import hbs from "hbs";
import path from "path";
import util from "util";
import logger from "morgan";
import cookieParser from "cookie-parser";
import DBG from "debug";
const debug = DBG("notes:debug");
const error = DBG("notes:error");
import { router as index } from "./routes/index.mjs";
import { router as notes } from "./routes/notes.mjs";
import * as rfs from "rotating-file-stream";
import createError from "http-errors";
import session from "express-session";
import sessionFileStore from "session-file-store";
const FileStore = sessionFileStore(session);
import { router as usersRouter, initPassport } from "./routes/users.mjs";

export const sessionCookieName = "notescookie.sid";

// Workaround for lack of __dirname in ES6 modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "partials"));

// Uncaught Exception Handler
process.on("uncaughtException", function (err) {
  error("I've crashed!!! - " + (err.stack || err));
});

// Unhandled Rejection Handler
process.on("unhandledRejection", (reason, p) => {
  error(`Unhandled Rejection at: ${util.inspect(p)} reason: ${reason}`);
});

var logStream;
if (process.env.REQUEST_LOG_FILE) {
  let logDirectory = path.dirname(process.env.REQUEST_LOG_FILE);
  fs.ensureDirSync(logDirectory);
  logStream = rfs.createStream(process.env.REQUEST_LOG_FILE, {
    size: "10M",
    interval: "1d",
    compress: "gzip",
  });
}

app.use(
  logger(process.env.REQUEST_LOG_FORMAT || "dev", {
    stream: logStream ? logStream : process.stdout,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new FileStore({ path: "sessions" }),
    secret: "keyboard mouse",
    resave: true,
    saveUninitialized: true,
    name: sessionCookieName,
  })
);
initPassport(app);

app.use("/", index);
app.use("/notes", notes);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // Use http-errors manually or just create error object since we removed the require
  // But wait, I missed http-errors in the import list from the user prompt!
  // The user prompt LISTED specific imports. It did NOT list http-errors.
  // "Change the block of require statements... to the following: ... import ..."
  // It listed fs, url, express, hbs, path, util, favicon(unused?), logger, cookieParser, bodyParser(unused?), DBG.
  // It missed http-errors which was line 1 of app.js.
  // I should check if I need it.
  // app.js line 1: const createError = require("http-errors");
  // app.js line 48: next(createError(404));
  // If I don't import it, line 48 will fail.
  // I will add `import createError from 'http-errors';` to be safe, even if the textbook snippet missed it (or maybe they handle 404 differently).
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  error((err.status || 500) + " " + err.message);
  res.render("error");
});

export default app;
