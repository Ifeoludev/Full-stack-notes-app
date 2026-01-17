//This file uses Axios to send POST requests to http://localhost:3333/create-user. It simulates what happens when a user signs up

import axios from "axios";
import util from "util";

const port = process.env.PORT || 3333;
const url = `http://localhost:${port}/create-user`;

async function addUser() {
  try {
    //We tell Axios to send data to the url
    const response = await axios.post(
      url,
      {
        username: "me",
        password: "word",
        provider: "local",
        familyName: "Einarrsdottir",
        givenName: "Ashildr",
        middleName: "",
        emails: [],
        photos: [],
      },
      {
        auth: {
          username: "them",
          password: "D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF",
        },
      }
    );

    console.log("Created " + util.inspect(response.data));
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

addUser();
