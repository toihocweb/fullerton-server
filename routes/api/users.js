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

// Load User model
const User = require("../../models/User");

/**
 * @api {GET} /api/v1/auth/test
 * @name Test
 * @access public
 */
router.get("/test", (req, res) => res.json({ msg: "Users API Works" }));

/**
 * @api {POST} /api/v1/auth/register
 * @name Register
 * @access public
 */
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  const { name, email, password } = req.body;

  // Check Validation
  if (!isValid) {
    return res.status(status.BAD_REQUEST).json(errors);
  }

  // Find user by email
  User.findOne({ email }).then((user) => {
    if (user) {
      errors.email = "Email already exists";
      errors.field = "email";
      return res.status(status.BAD_REQUEST).json(errors);
    } else {
      const newUser = new User({
        name,
        email,
        password,
      });

      bcrypt.genSalt(12, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.status(status.CREATED).json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

/**
 * @api {POST} /api/v1/auth/login
 * @name Login
 * @access public
 */
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(status.BAD_REQUEST).json(errors);
  }

  const { email, password } = req.body;

  // Find user by email
  User.findOne({ email }).then((user) => {
    // Check for user
    if (!user) {
      errors.email = "User not found";
      errors.field = "email";
      return res.status(status.NOT_FOUND).json(errors);
    }

    // Check Password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        const payload = { id: user.id, name: user.name, avatar: user.avatar }; // Create JWT Payload
        // Sign Token
        jwt.sign(
          payload,
          process.env.MONGO_KEY,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        errors.field = "password";
        return res.status(status.BAD_REQUEST).json(errors);
      }
    });
  });
});

/**
 * @api {GET} /api/v1/auth/current
 * @name Get Current User
 * @access private
 */
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) =>
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    })
);

module.exports = router;
