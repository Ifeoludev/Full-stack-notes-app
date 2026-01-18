import { Level } from "level";
import path from "path";
import util from "util";
import Note from "./Note.mjs";
import DBG from "debug";

const debug = DBG("notes:notes-level");
const error = DBG("notes:error-level");

let db;

//Ensures there is an active connection to the database
async function connectDB() {
  if (typeof db !== "undefined" && db) return db;
  db = new Level(process.env.LEVELDB_LOCATION || "notes.level", {
    createIfMissing: true,
    valueEncoding: "json",
  });
  await db.open();
  return db;
}

//Creating and Updating(I used the same code for both since they basically do the same thing)
async function crupdate(key, title, body) {
  const db = await connectDB();
  const note = new Note(key, title, body);//Creates the new note
  await db.put(key, note.JSON);
  return note;
}

export function create(key, title, body) {
  return crupdate(key, title, body);
}

export function update(key, title, body) {
  return crupdate(key, title, body); 
}

export async function read(key) {
  const db = await connectDB();
  const note = Note.fromJSON(await db.get(key));
  return new Note(note.key, note.title, note.body);
}

export async function destroy(key) {
  const db = await connectDB();
  await db.del(key);
}

export async function keylist() {
  const db = await connectDB();
  const keyz = [];
  for await (const key of db.keys()) {
    keyz.push(key);
  }
  return keyz;
}

export async function count() {
  const db = await connectDB();
  let total = 0;
  for await (const key of db.keys()) {
    total++;
  }
  return total;
}

export async function close() {
  const _db = db;
  db = undefined;
  return _db ? _db.close() : undefined;
}
