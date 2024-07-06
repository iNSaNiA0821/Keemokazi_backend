const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

const Schema = mongoose.Schema;

let User = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    balanceof: {
      type: Number,
      required: true,
    },
    subscription: {
      type: Boolean,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "users" }
);

module.exports = mongoose.model("users", User);
