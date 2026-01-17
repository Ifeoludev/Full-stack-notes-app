import * as usersModel from "./models/users-superagent.mjs";
import util from "util";

async function testConnection() {
  try {
    console.log("Attempting to list users from User Service...");
    const users = await usersModel.listUsers();
    console.log("Success! Users found:");
    console.log(util.inspect(users));
  } catch (err) {
    console.error("Failed to connect:", err);
  }
}

testConnection();
