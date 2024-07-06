require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const Routes = require("./router");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const fileUpload = require("express-fileupload");
const { allowedOrigins } = require("./config");

connectDB();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        console.log(msg, origin);
        return;
      }
      return callback(null, true);
    },
  })
);

app.use(express.json());
// Routes
app.use("/", Routes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
});
