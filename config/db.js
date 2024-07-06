require("dotenv").config();
const { MONGO_CONNECTION_URL } = require("../config");
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

function connectDB() {
  // Database connection
  mongoose.connect(MONGO_CONNECTION_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  });
  const connection = mongoose.connection;
  connection
    .once("open", () => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log("Connection failed");
    });
}

// mIAY0a6u1ByJsWWZ

module.exports = connectDB;
