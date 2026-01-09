import express from "express";
import bodyParser from "body-parser";
import util from "util";
import DBG from "debug";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

if (process.env.SEQUELIZE_CONNECT_USERS) {
  process.env.SEQUELIZE_CONNECT = process.env.SEQUELIZE_CONNECT_USERS;
}

import * as usersModel from "./users-sequelize.mjs";

const log = DBG("users:service");
const error = DBG("users:error");

const app = express();

// Middleware
app.use(check); // API Key Check(checks evbery request for an API key). Without the key, you can't talk to the server
app.use(bodyParser.json()); // Parse JSON bodies

// Create a user record
app.post("/create-user", async (req, res, next) => {
  try {
    var result = await usersModel.create(
      req.body.username,
      req.body.password,
      req.body.provider,
      req.body.familyName,
      req.body.givenName,
      req.body.middleName,
      req.body.emails,
      req.body.photos
    );
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update an existing user record
app.post("/update-user/:username", async (req, res, next) => {
  try {
    var result = await usersModel.update(
      req.params.username,
      req.body.password,
      req.body.provider,
      req.body.familyName,
      req.body.givenName,
      req.body.middleName,
      req.body.emails,
      req.body.photos
    );
    res.send(usersModel.sanitizedUser(result));
  } catch (err) {
    res.status(500).send(err);
  }
});

// Find a user, if not found create one given profile information
app.post("/find-or-create", async (req, res, next) => {
  log("find-or-create " + util.inspect(req.body));
  try {
    var result = await usersModel.findOrCreate({
      id: req.body.username,
      username: req.body.username,
      password: req.body.password,
      provider: req.body.provider,
      familyName: req.body.familyName,
      givenName: req.body.givenName,
      middleName: req.body.middleName,
      emails: req.body.emails,
      photos: req.body.photos,
    });
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Find the user data (does not return password)
app.get("/find/:username", async (req, res, next) => {
  try {
    var user = await usersModel.find(req.params.username);
    if (!user) {
      res.status(404).send(new Error("Did not find " + req.params.username));
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete/destroy a user record
app.delete("/destroy/:username", async (req, res, next) => {
  try {
    await usersModel.destroy(req.params.username);
    res.send({});
  } catch (err) {
    res.status(500).send(err);
  }
});

// Check password
app.post("/passwordCheck", async (req, res, next) => {
  try {
    var check = await usersModel.userPasswordCheck(
      req.body.username,
      req.body.password
    );
    res.send(check);
  } catch (err) {
    res.status(500).send(err);
  }
});

// List users
app.get("/list", async (req, res, next) => {
  try {
    var userlist = await usersModel.listUsers();
    if (!userlist) userlist = [];
    res.send(userlist);
  } catch (err) {
    console.error("List Users Error:", err);
    res.status(500).send(err.message);
  }
});

const port = process.env.USERS_PORT || process.env.PORT || 3333;
const server = app.listen(port, "localhost", function () {
  const addr = server.address();
  const host = addr ? addr.address : "localhost";
  const serverPort = addr ? addr.port : port;
  log("User-Auth-Service listening at http://" + host + ":" + serverPort);
});

// Mimic API Key authentication.
var apiKeys = [
  {
    user: "them",
    key: "D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF",
  },
];

function check(req, res, next) {
  // Check for Basic Auth headers
  if (
    req.headers.authorization &&
    req.headers.authorization.indexOf("Basic ") === 0
  ) {
    // decode base64 header
    var auth = Buffer.from(req.headers.authorization.split(" ")[1], "base64")
      .toString()
      .split(":");
    var user = auth[0];
    var pass = auth[1];

    var found = false;
    for (let key of apiKeys) {
      if (key.key === pass && key.user === user) {
        found = true;
        break;
      }
    }
    if (found) next();
    else {
      res.status(401).send("Not authenticated");
    }
  } else {
    res.status(500).send("No Authorization Key");
  }
}
