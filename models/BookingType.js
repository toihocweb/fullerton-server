const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuidv4 = require("uuid").v4;

// BookingType Schema
const BookingTypeSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    name: String,
    identitor: String,
  },
  {
    timestamps: true,
  }
);

module.exports = BookingType = mongoose.model(
  "booking_types",
  BookingTypeSchema
);
