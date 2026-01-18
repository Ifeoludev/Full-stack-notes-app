import { assert } from "chai";
import request from "superagent";

// Since we are running inside the container where the app is also running (via npm test, but typically npm test runs in a container that might NOT be the server itself if we split them)
// However, in our docker-compose, 'notes-test' runs 'npm test'.
// The 'notes-test' container DOES NOT start the express app by default when running 'npm test'.
// So we must start the server WITHIN this test file or ensure it's running.
// Given node structure, we can import app and start it.

import app from "../app.mjs";
import http from "http";

describe("Notes REST Service", function () {
  let server;
  let port = 3000;
  let baseUrl = `http://localhost:${port}`;

  before(function (done) {
    // Start the server
    server = http.createServer(app);
    server.listen(port);
    server.on("listening", () => {
      console.log(`Test server listening on port ${port}`);
      done();
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        // If it's already running (maybe by another test? unlikely), just proceed
        console.log("Server already running");
        done();
      } else {
        done(err);
      }
    });
  });

  after(function (done) {
    if (server) server.close(done);
    else done();
  });

  it("should get home page", async () => {
    const res = await request.get(baseUrl + "/");
    assert.equal(res.status, 200);
    // assert.include(res.text, 'Notes'); // Check for content if needed
  });

  // Add more tests as needed, e.g. for /notes/add
});
