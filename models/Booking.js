const mongoose = require("mongoose");
const { schema } = require("./User");
const Schema = mongoose.Schema;
const uuidv4 = require("uuid").v4;

// enum status
const STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Booking Schema
const BookingSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    status: {
      type: String,
      enum: [STATUS.PENDING, STATUS.APPROVED, STATUS.REJECTED],
      default: STATUS.PENDING,
    },
    reason: String,
    location: {
      type: String,
      required: true,
    },
    times: Array,
    user: {
      type: String,
      ref: "users",
    },
    booking_type: {
      type: String,
      ref: "booking_types",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  STATUS,
  Booking: mongoose.model("bookings", BookingSchema),
};
