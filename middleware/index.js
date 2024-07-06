const { allowedOrigins } = require("../config");

const isAllowedOrigin = (req, res, next) => {
  let origin = req.get("origin");

  if (origin == "undefined" || allowedOrigins.indexOf(origin) === -1) {
    return res.status(404).send("sorry we don't have this api");
  }

  return next();
};

module.exports = {
  isAllowedOrigin
};