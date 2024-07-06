var jwtSecret = "jwtSecret";

const MONGO_CONNECTION_URL =
  "mongodb+srv://keemokazi:kch199139@cluster0.tz4ae.mongodb.net/?retryWrites=true&w=majority";
const allowedOrigins = ["https://www.keemokaziconsulting.com"];
// const allowedOrigins = ["http://localhost:3000"];

module.exports = {
  jwtSecret,
  MONGO_CONNECTION_URL,
  allowedOrigins,
};
