//This file uses AXIOS to send a GET request to http://localhost:3333/find/me. It prints out the user details to prove they are saved.

import axios from "axios";
import util from "util";

const port = process.env.PORT || 3333;
const username = process.argv[2]; //Get the username from the command line arguments

if (!username) {
  console.error(
    "Please provide a username to find (e.g., 'node users-find.mjs me')"
  );
  process.exit(1);
}

const url = `http://localhost:${port}/find/${username}`;

async function findUser() {
  try {
    //We ask for data at the url
    const response = await axios.get(url, {
      auth: {
        username: "them",
        password: "D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF",
      },
    });

    console.log("Found " + util.inspect(response.data));
  } catch (error) {
    if (error.response) {
      console.error(
        `Error: ${error.response.status} - ${util.inspect(error.response.data)}`
      );
    } else {
      console.error("Error:", error.message);
    }
  }
}

findUser();
