import EventEmitter from "events";

//Defines a class that inherits from the Nodejs eventEmitter in-built class
class NotesEmitter extends EventEmitter {
  noteCreated(note) {
    //Helper to "broadcast" notecreate
    this.emit("notecreated", note);
  }
  noteUpdate(note) {
    this.emit("noteupdate", note);
  }
  noteDestroy(data) {
    this.emit("notedestroy", data);
  }
}

export default new NotesEmitter();
