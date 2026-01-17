import Sequelize from "sequelize";
import jsyaml from "js-yaml";
import fs from "fs-extra";
import EventEmitter from "events";
import DBG from "debug";

class MessagesEmitter extends EventEmitter {}

const debug = DBG("notes:model-messages");
const error = DBG("notes:error-messages");

var SQMessage;
var sequlz;

export const emitter = new MessagesEmitter();

//ensures connection to the database and defines the table structure
async function connectDB() {
  if (typeof sequlz === "undefined") {
    const yamltext = await fs.readFile(process.env.SEQUELIZE_CONNECT, "utf8");
    const params = jsyaml.load(yamltext, "utf8");
    sequlz = new Sequelize(
      params.dbname,
      params.username,
      params.password,
      params.params
    );
  }
  if (SQMessage) return SQMessage.sync();
  SQMessage = sequlz.define("Message", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    from: Sequelize.STRING,
    namespace: Sequelize.STRING,
    message: Sequelize.STRING(1024),
    timestamp: Sequelize.DATE,
  });
  return SQMessage.sync();
}

//saves a message and notifies a new message
export async function postMessage(from, namespace, message) {
  //connects to the DB
  const SQMessage = await connectDB();
  //store message
  const newmsg = await SQMessage.create({
    from,
    namespace,
    message,
    timestamp: new Date(),
  });
  var toEmit = {
    id: newmsg.id,
    from: newmsg.from,
    namespace: newmsg.namespace,
    message: newmsg.message,
    timestamp: newmsg.timestamp,
  };
  emitter.emit("newmessage", toEmit);
}

//deletes a message/comment
export async function destroyMessage(id, namespace) {
  const SQMessage = await connectDB();
  const msg = await SQMessage.findOne({ where: { id } });
  if (msg) {
    await msg.destroy();
    //shouts message destroyed
    emitter.emit("destroymessage", { id, namespace });
  }
}

//loads history when you open a note
export async function recentMessages(namespace) {
  const SQMessage = await connectDB();
  const messages = await SQMessage.findAll({
    where: { namespace },
    order: [["timestamp", "ASC"]], //orders the messages by time
    limit: 20, //grabs the last 20 messages
  });
  return messages.map((message) => {
    return {
      id: message.id,
      from: message.from,
      namespace: message.namespace,
      message: message.message,
      timestamp: message.timestamp,
    };
  });
}
