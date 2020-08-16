const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const status = require("http-status");
// Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateBookingInput = require("../../validation/booking");
const validateBookingTypeInput = require("../../validation/bookingtype");

// Load User model
const User = require("../../models/User");
const Booking = require("../../models/Booking");
const BookingType = require("../../models/BookingType");

/**
 * @api {GET} /api/v1/bookings/test
 * @name Test
 * @access public
 */
router.get("/test", (req, res) => res.json({ msg: "Bookings API Works" }));

/**
 * @api {GET} /api/v1/bookings
 * @name Get All bookings
 * @access public
 */
router.get("/", (req, res) => {
  Booking.find()
    .populate({ path: "booking_type", select: "identitor name" })
    .populate({ path: "user", select: "name email role" })
    .exec((err, bookings) => {
      if (err) {
        throw new Error(err);
      }
      res.json(bookings);
    });
  // .sort({ date: -1 })
  // .then((booking) => {
  //   booking.populate("booking_types").exec((err, bookings) => {
  //     if (err) {
  //       console.log("err", err);
  //     }
  //     res.json(bookings);
  //   });
  // })
  // .catch((err) => {
  //   console.log(err);
  //   res
  //     .status(404)
  //     .json({ code: status.NOT_FOUND, msg: "No bookings found" });
  // });
});

/**
 * @api {POST} /api/v1/bookings/new
 * @name Create new bookings
 * @access private
 */
router.post("/new", (req, res) => {
  const { errors, isValid } = validateBookingInput(req.body);
  const { user, location, booking_type } = req.body;
  // Check Validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  }

  const newBooking = new Booking({
    location,
    user,
    booking_type,
  });
  newBooking.save().then((booking) => res.json(booking));
});

/**
 * @api {GET} /api/v1/bookings/type
 * @name Create new bookings type
 * @access private
 */
router.post("/type", (req, res) => {
  const { errors, isValid } = validateBookingTypeInput(req.body);
  const { identitor, name } = req.body;
  // Check Validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  }

  const newBookingType = new BookingType({
    name,
    identitor,
  });
  newBookingType.save().then((type) => res.json(type));
});

module.exports = router;
