import { assert } from "chai";
import * as users from "../models/users-superagent.mjs";

describe("User Service REST", function () {
  let username = "user1";
  let password = "password";
  let familyName = "User";
  let givenName = "One";
  let middleName = "Test";
  let emails = ["user1@example.com"];
  let photos = [];

  // The userauth service might take a moment to start up and connect to its DB.
  // We increase timeout.
  this.timeout(40000);

  before(async function () {
    // Wait for service to be ready
    let retries = 20;
    while (retries > 0) {
      try {
        await users.listUsers();
        return;
      } catch (e) {
        console.log("Waiting for user service...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        retries--;
      }
    }
    throw new Error("Could not connect to user service after retries");
  });

  it("should create a user", async () => {
    try {
      // In case it already exists from previous run (though container is fresh usually)
      try {
        await users.destroy(username);
      } catch (e) {}

      const user = await users.create(
        username,
        password,
        "local",
        familyName,
        givenName,
        middleName,
        emails,
        photos,
      );

      assert.equal(user.username, username);
      assert.equal(user.familyName, familyName);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("should find a user", async () => {
    const user = await users.find(username);
    assert.equal(user.username, username);
  });

  it("should check password", async () => {
    const check = await users.userPasswordCheck(username, password);
    assert.equal(check.check, true);
  });
});
