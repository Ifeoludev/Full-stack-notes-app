import { assert } from "chai";
import Note from "../models/Note.mjs";

describe("Model Note", () => {
  it("should create a Note", () => {
    const note = new Note("key", "title", "body");
    assert.equal(note.key, "key");
    assert.equal(note.title, "title");
    assert.equal(note.body, "body");
  });

  it("should convert to JSON", () => {
    const note = new Note("key", "title", "body");
    const json = note.JSON;
    const data = JSON.parse(json);
    assert.equal(data.key, "key");
    assert.equal(data.title, "title");
    assert.equal(data.body, "body");
  });

  it("should create from JSON", () => {
    const json = JSON.stringify({ key: "key", title: "title", body: "body" });
    const note = Note.fromJSON(json);
    assert.equal(note.key, "key");
    assert.equal(note.title, "title");
    assert.equal(note.body, "body");
  });

  it("should fail to create a Note with no key", () => {
    assert.throws(() => {
      new Note("", "title", "body");
    }, /missing key/);
  });

  it("should fail to create a Note with no title", () => {
    assert.throws(() => {
      new Note("key", "", "body");
    }, /missing title/);
  });
});
