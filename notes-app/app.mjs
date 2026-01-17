import fs from "fs-extra";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

// Workaround for lack of __dirname in ES6 modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure dotenv before other imports
dotenv.config({ path: path.join(__dirname, ".env") });

if (process.env.SEQUELIZE_CONNECT_NOTES) {
  process.env.SEQUELIZE_CONNECT = process.env.SEQUELIZE_CONNECT_NOTES;
}

import express from "express";
import hbs from "hbs";
import util from "util";
import logger from "morgan";
import cookieParser from "cookie-parser";
import DBG from "debug";
const debug = DBG("notes:debug");
const error = DBG("notes:error");

import { router as index, socketio as indexSocketio } from "./routes/index.mjs";
import { router as notes, socketio as notesSocketio } from "./routes/notes.mjs";
import { router as usersRouter, initPassport } from "./routes/users.mjs";

import { createStream } from "rotating-file-stream";
import createError from "http-errors";
import session from "express-session";
import sessionFileStore from "session-file-store";

import http from "http";
import { Server } from "socket.io";
import passportSocketIo from "passport.socketio";

const app = express();
export default app;

const server = http.createServer(app);
const io = new Server(server);

const FileStore = sessionFileStore(session);
export const sessionCookieName = "notescookie.sid";
const sessionSecret = "keyboard mouse";
const sessionStore = new FileStore({ path: "sessions" });

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: sessionCookieName,
    secret: sessionSecret,
    store: sessionStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,
  })
);

function onAuthorizeSuccess(data, accept) {
  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  accept(null, false);
}

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
  logStream = createStream(process.env.REQUEST_LOG_FILE, {
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
    store: sessionStore,
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    name: sessionCookieName,
  })
);
initPassport(app);

app.use("/", index);
app.use("/notes", notes);
app.use("/users", usersRouter);

indexSocketio(io);
notesSocketio(io);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
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

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
