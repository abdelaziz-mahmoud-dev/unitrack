process.env.JWT_SECRET = "test_secret";
process.env.JWT_EXPIRES_IN = "1h";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

const connect = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await mongoose.syncIndexes(); // عشان الـ unique indexes تتبني قبل أول test
};

const clear = async () => {
  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
};

const close = async () => {
  await mongoose.disconnect();
  await mongod.stop();
};

module.exports = { connect, clear, close };