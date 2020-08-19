const express = require("express");
const router = express.Router();
const passport = require("passport");

// Load Input Validation
const validateBookingInput = require("../../validation/booking");
const validateBookingTypeInput = require("../../validation/bookingtype");

// Load User model
const User = require("../../models/User");

// Load Booking model
const { Booking, STATUS } = require("../../models/Booking");
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
 * @access private
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.user.role !== "admin") {
      return res.send("Invalid Role");
    }
    Booking.find()
      .populate({ path: "booking_type", select: "identitor name" })
      .populate({ path: "user", select: "name email role" })
      .exec((err, bookings) => {
        if (err) {
          throw new Error(err);
        }
        res.json(bookings);
      });
  }
);

/**
 * @api {POST} /api/v1/bookings/new
 * @name Create new bookings
 * @access private
 */
router.post(
  "/new",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { user, location, booking_type, times } = req.body;
    console.log(times);
    const { errors, isValid } = validateBookingInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newBooking = new Booking({
      location,
      user,
      booking_type,
      times,
    });
    newBooking.save().then((booking) => res.json(booking));
  }
);

/**
 * @api {POST} /api/v1/bookings/type
 * @name Create new bookings type
 * @access public
 */
router.post(
  "/type",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
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
  }
);

/**
 * @api {GET} /api/v1/bookings/types
 * @name Get all booking types
 * @access public
 */
router.get("/types", (req, res) => {
  BookingType.find({}).then((types) => res.json(types));
});

/**
 * @api {GET} /api/v1/bookings/user/:userId
 * @name Get booking by userId
 * @access private
 */
router.get(
  "/user/:userId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const userId = req.params.userId;

    //check userId empty
    if (!userId) {
      return res.status(400).json({ msg: "userId is required!" });
    }

    User.findById(userId)
      .then((user) => {
        if (user) {
          if (user.role === "admin") {
            Booking.find()
              .populate({ path: "booking_type", select: "identitor name" })
              .populate({ path: "user", select: "name email role" })
              .exec((err, bookings) => {
                if (err) {
                  throw new Error(err);
                }
                res.json(bookings);
              });
          } else {
            Booking.find({ user: userId })
              .populate({ path: "booking_type", select: "identitor name" })
              .populate({ path: "user", select: "name email role" })
              .exec((err, bookings) => {
                if (err) {
                  throw new Error(err);
                }
                res.json(bookings);
              });
          }
        } else {
          return res.status(404).json({ msg: "User is not found" });
        }
      })
      .catch((err) => res.json(err));
  }
);

/**
 * @api {POST} /api/v1/bookings/status/:status/:bookingId
 * @name Update status an booking
 * @access private
 */
router.post(
  "/status/:status/:bookingId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { bookingId, status } = req.params;
    const { data } = req.body;
    //check userId empty
    if (!bookingId) {
      return res.status(400).json({ msg: "userId is required!" });
    }

    if (req.user.role !== "admin") {
      return res.send("Invalid Role");
    }

    Booking.findById(bookingId)
      .then((booking) => {
        // check status pending
        if (!booking.status || booking.status !== "pending") {
          return res.status(400).json({ msg: "Can not edit status" });
        }

        // update status to approve
        if (status === "approve") {
          booking.status = STATUS.APPROVED;
          booking.times = data;
          booking
            .save()
            .then((booking) => res.json(booking))
            .catch((err) => res.json(err));
        }

        // update status to reject
        if (status === "reject") {
          booking.status = STATUS.REJECTED;
          booking.reason = data;
          booking
            .save()
            .then((booking) => res.json(booking))
            .catch((err) => res.json(err));
        }
      })
      .catch((err) => res.json(err));
  }
);

/**
 * @api {DELETE} /api/v1/bookings/:bookingId
 * @name Cancel a booking
 * @access private
 */
router.delete(
  "/:bookingId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { bookingId } = req.params;
    //check userId empty
    if (!bookingId) {
      return res.status(400).json({ msg: "Id is required!" });
    }

    Booking.findById(bookingId)
      .then((booking) => {
        if (!booking.status || booking.status !== "pending") {
          return res.status(400).json({ msg: "Can not cancel this booking" });
        }

        booking
          .remove()
          .then((booking) => res.json(booking))
          .catch((err) => {
            throw new Error(err);
          });
      })
      .catch((err) => res.json(err));
  }
);

module.exports = router;
