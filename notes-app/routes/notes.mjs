import util from "util";
import express from "express";
import * as notes from "../models/notes.mjs";

export const router = express.Router();

//Add Note
router.get("/add", (req, res, next) => {
  res.render("noteedit", {
    title: "Add a note",
    docreate: true,
    notekey: "",
    note: undefined,
  });
});

//Save Note(update)
router.post("/save", async (req, res, next) => {
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
    note: note,
  });
});

//Edit Note(update)
router.get("/edit", async (req, res, next) => {
  let note = await notes.read(req.query.key); //This gets the value of the key from the URL
  res.render("noteedit", {
    title: note ? "Edit " + note.title : "Add a Note", //If note exists,, the page will say "Edit[Note Title]", if missing it defaults to "Add a note"
    docreate: false,
    notekey: req.query.key,
    note: note,
  });
});

//Ask to Delete a Note
router.get("/destroy", async function (req, res, next) {
  let note = await notes.read(req.query.key);
  res.render("notedestroy", {
    title: note ? `Delete ${note.title}` : "",
    notekey: req.query.key,
    note: note,
  });
});

//Really destroy note (destroy)
router.post("/destroy/confirm", async (req, res, next) => {
  await notes.destroy(req.body.notekey);
  res.redirect("/");
});
