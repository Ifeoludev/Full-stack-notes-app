import Note from "./Note.mjs";

let notes = [];

export async function update(key, title, body) {
  notes[key] = new Note(key, title, body);
  return notes[key];
}

export async function create(key, title, body) {
  notes[key] = new Note(key, title, body);
  return notes[key];
}

export async function read(key) {
  if (notes[key]) return notes[key];
  else throw new Error(`Note ${key} does not exist`);
}

export async function destroy(key) {
  if (notes[key]) {
    delete notes[key];
  } else throw new Error(`Note ${key} does not exist`);
}

export async function keylist() {
  return Object.keys(notes);
}

export async function count() {
  return notes.length;
}

export async function close() {}
