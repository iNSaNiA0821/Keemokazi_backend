const { MONGO_CONNECTION_URL } = require("../config");
module.exports = {
  mongoURI: MONGO_CONNECTION_URL,
  JWTKey: "secret",
};
