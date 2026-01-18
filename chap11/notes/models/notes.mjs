import _events from "./notes-events.mjs";
export const events = _events;

let NotesModule;

async function model() {
  if (NotesModule) return NotesModule;
  NotesModule = await import(`../models/notes-${process.env.NOTES_MODEL}.mjs`);
  return NotesModule;
}

//Creates the note from the DB
export async function create(key, title, body) {
  //Waits for it to finish uccessfully
  const note = await (await model()).create(key, title, body);
  //Announces to everyone that a note was created
  _events.noteCreated(note);
  return note;
}
export async function update(key, title, body) {
  const note = await (await model()).update(key, title, body);
  _events.noteUpdate(note);
  return note;
}
export async function read(key) {
  return (await model()).read(key);
}
export async function destroy(key) {
  await (await model()).destroy(key);
  _events.noteDestroy({ key });
  return key;
}
export async function keylist() {
  return (await model()).keylist();
}
export async function count() {
  return (await model()).count();
}
export async function close() {
  return (await model()).close();
}
