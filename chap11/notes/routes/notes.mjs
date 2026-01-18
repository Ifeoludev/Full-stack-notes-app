import util from "util";
import express from "express";
import * as notes from "../models/notes.mjs";
import { ensureAuthenticated } from "./users.mjs";

import * as messages from "../models/messages-sequelize.mjs";

export const router = express.Router();

//This function wires Socket.io to model events
export const socketio = function (io) {
  io.of("/view").on("connection", function (socket) {
    // 'cb' is a function sent from the browser, to which we
    // send the messages for the named note.
    socket.on("getnotemessages", (namespace, cb) => {
      messages
        .recentMessages(namespace)
        .then(cb)
        .catch((err) => console.error(err.stack));
    });
  });

  messages.emitter.on("newmessage", (newmsg) => {
    io.of("/view").emit("newmessage", newmsg);
  });
  messages.emitter.on("destroymessage", (data) => {
    io.of("/view").emit("destroymessage", data);
  });

  //Listens to model events(if anything is edited, tell other clients/users)
  notes.events.on("noteupdate", (newnote) => {
    //Emits to view note page(view is like a room where all clients are, everyone sees what is edited)
    io.of("/view").emit("noteupdate", newnote);
  });
  notes.events.on("notedestroy", (data) => {
    io.of("/view").emit("notedestroy", data);
  });
};

// Save incoming message to message pool, then broadcast it
router.post("/make-comment", ensureAuthenticated, async (req, res, next) => {
  try {
    await messages.postMessage(
      req.body.from,
      req.body.namespace,
      req.body.message
    );
    res.status(200).json({});
  } catch (err) {
    res.status(500).end(err.stack);
  }
});

// Delete the indicated message
router.post("/del-message", ensureAuthenticated, async (req, res, next) => {
  try {
    await messages.destroyMessage(req.body.id, req.body.namespace);
    res.status(200).json({});
  } catch (err) {
    res.status(500).end(err.stack);
  }
});

//Add Note
router.get("/add", ensureAuthenticated, (req, res, next) => {
  res.render("noteedit", {
    title: "Add a Note",
    docreate: true,
    notekey: "",
    note: undefined,
    user: req.user,
  });
});

//Save Note(update)
router.post("/save", ensureAuthenticated, async (req, res, next) => {
  let note;
  if (req.body.docreate === "create") {
    note = await notes.create(req.body.notekey, req.body.title, req.body.body);
  } else {
    note = await notes.update(req.body.notekey, req.body.title, req.body.body);
  }
  res.redirect("/notes/view?key=" + req.body.notekey);
});

// Read Note (read)
router.get("/view", async (req, res, next) => {
  let note = await notes.read(req.query.key);
  res.render("noteview", {
    title: note ? note.title : "",
    notekey: req.query.key,
    user: req.user ? req.user : undefined,
    note: note,
  });
});

//Edit Note(update)
router.get("/edit", ensureAuthenticated, async (req, res, next) => {
  let note = await notes.read(req.query.key);
  res.render("noteedit", {
    title: note ? "Edit " + note.title : "Add a Note",
    docreate: false,
    notekey: req.query.key,
    user: req.user,
    note: note,
  });
});

//Ask to Delete a Note
router.get("/destroy", ensureAuthenticated, async (req, res, next) => {
  let note = await notes.read(req.query.key);
  res.render("notedestroy", {
    title: note ? `Delete ${note.title}` : "",
    notekey: req.query.key,
    user: req.user,
    note: note,
  });
});

//Really destroy note (destroy)
router.post("/destroy/confirm", ensureAuthenticated, async (req, res, next) => {
  await notes.destroy(req.body.notekey);
  res.redirect("/");
});
