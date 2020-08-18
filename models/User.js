const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuidv4 = require("uuid").v4;

const ROLE = {
  USER: "user",
  ADMIN: "admin",
};

// Create Schema
const UserSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      emum: [ROLE.USER, ROLE.ADMIN],
      default: ROLE.USER,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = User = mongoose.model("users", UserSchema);
