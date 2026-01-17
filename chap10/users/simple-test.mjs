import * as Users from "./users-sequelize.mjs";

async function simpleTest() {
  try {
    console.log("Connecting...");
    await Users.create("test", "pwd", "local", "Test", "User", "M", [], []);
    console.log("Connected and created user.");
    Users.close();
  } catch (e) {
    console.error("Simple Test Error:", e);
  }
}
simpleTest();
