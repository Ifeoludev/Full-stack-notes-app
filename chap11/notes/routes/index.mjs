import util from "util";
import express from "express";
import * as notes from "../models/notes.mjs";

export const router = express.Router();

async function getKeyTitlesList() {
  //Fetch the list of all note keys from the model
  const keylist = await notes.keylist();
  //Reads the note and extracts the key and title
  var keyPromises = keylist.map((key) => {
    return notes.read(key).then((note) => {
      return { key: note.key, title: note.title };
    });
  });
  return Promise.all(keyPromises);
}

export const socketio = function (io) {
  //This is the reusable function that will prepare and send the update
  var emitNoteTitles = async () => {
    //This fetches the fresh list of notes using the new helper function
    const notelist = await getKeyTitlesList();
    //Only clients connected to the home page receive the messages
    io.of("/home").emit("notetitles", { notelist });
  };
  //Whenever a note is created, updated or destroyed, call emitNoteTitles
  notes.events.on("notecreated", emitNoteTitles);
  notes.events.on("noteupdate", emitNoteTitles);
  notes.events.on("notedestroy", emitNoteTitles);
};

/* GET home page. */
router.get("/", async (req, res, next) => {
  try {
    //Call the helper function
    let notelist = await getKeyTitlesList();
    res.render("index", {
      title: "Notes",
      notelist: notelist,
      user: req.user ? req.user : undefined,
    });
  } catch (e) {
    next(e);
  }
});
