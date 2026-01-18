import Sequelize from "sequelize";
import jsyaml from "js-yaml";
import fs from "fs-extra";
import util from "util";
import DBG from "debug";
const log = DBG("users:model-users");
const error = DBG("users:error");

let SQUser;
let sequlz;

async function connectDB() {
  //If it is already connected, just return it
  if (SQUser) return SQUser.sync();

  const yamltext = await fs.readFile(process.env.SEQUELIZE_CONNECT, "utf8");
  const params = jsyaml.load(yamltext); // Changed safeLoad to load for modern js-yaml compatibility

  if (!sequlz) {
    sequlz = new Sequelize(
      params.dbname,
      params.username,
      params.password,
      params.params
    );
  }

  //Define the User Table
  if (!SQUser) {
    SQUser = sequlz.define("User", {
      username: { type: Sequelize.STRING, unique: true },
      password: Sequelize.STRING, //must be unique
      provider: Sequelize.STRING,
      familyName: Sequelize.STRING,
      givenName: Sequelize.STRING,
      middleName: Sequelize.STRING,
      emails: Sequelize.STRING(2048), //stored as JSON string(SQLite can't store arrays directly)
      photos: Sequelize.STRING(2048), //also stored as a JSON string
    });
  }
  return SQUser.sync(); //this creates the table if it does not exist
}

export async function create(
  username,
  password,
  provider,
  familyName,
  givenName,
  middleName,
  emails,
  photos
) {
  await connectDB();
  return SQUser.create({
    username,
    password,
    provider,
    familyName,
    givenName,
    middleName,
    emails: JSON.stringify(emails),
    photos: JSON.stringify(photos),
  });
}

//finds an existing user and updates their profile data
export async function update(
  username,
  password,
  provider,
  familyName,
  givenName,
  middleName,
  emails,
  photos
) {
  await connectDB();
  const user = await SQUser.findOne({ where: { username: username } });
  if (!user) return undefined;
  return user.update({
    password,
    provider,
    familyName,
    givenName,
    middleName,
    emails: JSON.stringify(emails),
    photos: JSON.stringify(photos),
  });
}

//Finding a user by their ID
export async function find(username) {
  await connectDB();
  const user = await SQUser.findOne({ where: { username: username } });
  return user ? sanitizedUser(user) : undefined; //This removes secret stuff before letting other code see it
}

export async function destroy(username) {
  await connectDB();
  const user = await SQUser.findOne({ where: { username: username } });
  if (!user) throw new Error(`Did not find requested ${username} to delete`);
  user.destroy();
}

//Finds a user, retrieves the user and returns a clear result
export async function userPasswordCheck(username, password) {
  await connectDB();
  const user = await SQUser.findOne({ where: { username: username } });
  if (!user) {
    return { check: false, username: username, message: "Could not find user" };
  } else if (user.username === username && user.password === password) {
    return { check: true, username: user.username };
  } else {
    return { check: false, username: username, message: "Incorrect password" };
  }
}

export async function findOrCreate(profile) {
  const user = await find(profile.id);
  if (user) return user;
  return await create(
    profile.id,
    profile.password,
    profile.provider,
    profile.familyName,
    profile.givenName,
    profile.middleName,
    profile.emails,
    profile.photos
  );
}

export async function listUsers() {
  await connectDB();
  const userlist = await SQUser.findAll({});
  return userlist.map((user) => sanitizedUser(user));
}

export function sanitizedUser(user) {
  let ret = {
    id: user.username,
    username: user.username,
    provider: user.provider,
    familyName: user.familyName,
    givenName: user.givenName,
    middleName: user.middleName,
    emails: [],
    photos: [],
  };
  try {
    ret.emails = JSON.parse(user.emails);
  } catch (e) {
    ret.emails = [];
  }
  try {
    ret.photos = JSON.parse(user.photos);
  } catch (e) {
    ret.photos = [];
  }
  return ret;
}

export function close() {
  if (sequlz) sequlz.close();
  sequlz = undefined;
  SQUser = undefined;
}
